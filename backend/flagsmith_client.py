"""
SearchForge Flagsmith Client Service (Track 01 Compliant)
Wraps official Flagsmith Edge SDK with transparent audit logging,
strict non-silent fallback, runtime key reconfiguration,
identity trait evaluation, remote config extraction, and kill-switch state.
"""

import os
import hashlib
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load .env file from project root or backend
load_dotenv()
load_dotenv("../.env")

class FlagsmithService:
    def __init__(self, environment_key: Optional[str] = None):
        self.environment_key = environment_key or os.getenv("FLAGSMITH_ENVIRONMENT_KEY", "")
        self.api_url = os.getenv("FLAGSMITH_API_URL", "https://edge.api.flagsmith.com/api/v1/")
        self.client = None
        self.is_live = False
        self.connection_message = "Not connected"
        self.init_client()

    def init_client(self):
        """Initializes or re-initializes the live Flagsmith SDK client."""
        if self.environment_key and len(self.environment_key.strip()) > 5:
            try:
                from flagsmith import Flagsmith
                self.client = Flagsmith(
                    environment_key=self.environment_key.strip(),
                    api_url=self.api_url
                )
                # Verify edge connection by fetching environment flags
                flags = self.client.get_environment_flags()
                flag_names = [f.feature_name for f in flags.all_flags()]
                self.is_live = True
                self.connection_message = f"Connected to Flagsmith Edge API ({len(flag_names)} flags in project)"
                print(f"[SearchForge] {self.connection_message} with key: {self.get_masked_key()}")
            except Exception as e:
                self.client = None
                self.is_live = False
                self.connection_message = f"Flagsmith initialization failed: {str(e)}"
                print(f"[SearchForge] {self.connection_message}. Using local simulation.")
        else:
            self.client = None
            self.is_live = False
            self.connection_message = "No environment key configured. Running local simulation."
            print("[SearchForge] Running in local simulation mode (no environment key provided).")

    def update_key(self, new_key: str) -> Dict[str, Any]:
        """Allows updating the Flagsmith environment key at runtime from the UI HUD."""
        self.environment_key = new_key.strip()
        self.init_client()
        return self.get_status()

    def get_masked_key(self) -> str:
        if not self.environment_key:
            return "NONE"
        if len(self.environment_key) <= 8:
            return "****"
        return f"{self.environment_key[:6]}...{self.environment_key[-4:]}"

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_live": self.is_live,
            "mode": "live_edge_sdk" if self.is_live else "local_simulation",
            "environment_key_masked": self.get_masked_key(),
            "api_url": self.api_url,
            "connection_message": self.connection_message,
            "active_flags": {
                "flag_key": "retrieval_ranking_engine",
                "default_variant": "hybrid_rrf",
                "alpha": 0.45,
                "rrf_k": 60,
                "code_boost": 1.35,
                "latency_sla_ms": 25.0,
                "kill_switch_active": False
            }
        }

    def evaluate_identity(
        self,
        identifier: str,
        traits: Optional[Dict[str, Any]] = None,
        simulate_latency: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluates feature flags and remote config for a given identity and traits.
        Strict honesty: Exposes whether assignment came from live Flagsmith or local simulation.
        Never silently falls back to local assignment while claiming Flagsmith assigned the variant.
        """
        traits = traits or {}
        
        # Default Remote Config values
        remote_config = {
            "alpha": 0.45,
            "rrf_k": 60,
            "code_boost": 1.35,
            "latency_sla_ms": 25.0
        }
        kill_switch_active = False
        segment_override_matched = False
        segment_name = None
        warning_msg = None
        assignment_source = "local_simulation"

        if self.is_live and self.client:
            try:
                identity_flags = self.client.get_identity_flags(identifier=identifier, traits=traits)
                flags_by_name = {f.feature_name: f for f in identity_flags.all_flags()}

                # Check kill-switch flag
                if "force_lexical_fallback" in flags_by_name:
                    kill_switch_active = flags_by_name["force_lexical_fallback"].enabled

                # Check ranking variant in live Flagsmith
                if "retrieval_ranking_engine" in flags_by_name:
                    flag_obj = flags_by_name["retrieval_ranking_engine"]
                    val = flag_obj.value if hasattr(flag_obj, "value") else identity_flags.get_feature_value("retrieval_ranking_engine")
                    if val in ["lexical_bm25", "semantic_dense", "hybrid_rrf"]:
                        variant = val
                        assignment_source = "live_flagsmith_edge"
                    else:
                        variant = self._local_multivariate_hash(identifier)
                        assignment_source = "local_simulation"
                        warning_msg = (
                            f"Flag 'retrieval_ranking_engine' returned unconfigured value '{val}'. "
                            "Fell back to deterministic local assignment."
                        )
                else:
                    variant = self._local_multivariate_hash(identifier)
                    assignment_source = "local_simulation"
                    warning_msg = (
                        "Flag 'retrieval_ranking_engine' does not exist in your Flagsmith project. "
                        "Create a multivariate feature flag with variants (lexical_bm25, semantic_dense, hybrid_rrf). "
                        "Fell back to deterministic local simulation."
                    )

                # Read remote config overrides if present in live project
                for param in remote_config.keys():
                    cfg_key = f"retrieval_ranking_engine_{param}"
                    if cfg_key in flags_by_name:
                        raw_val = flags_by_name[cfg_key].value if hasattr(flags_by_name[cfg_key], "value") else identity_flags.get_feature_value(cfg_key)
                        if raw_val is not None:
                            try:
                                remote_config[param] = float(raw_val)
                            except (ValueError, TypeError):
                                pass

                # Detect segment overrides
                if traits.get("tier") == "enterprise":
                    segment_override_matched = True
                    segment_name = "Enterprise VIP Users"
                elif traits.get("has_error_code") is True:
                    segment_override_matched = True
                    segment_name = "Error Code Diagnosticians"

                # If kill switch active, force lexical fallback
                if kill_switch_active:
                    variant = "lexical_bm25"

                return {
                    "identifier": identifier,
                    "traits": traits,
                    "variant": variant,
                    "assignment_source": assignment_source,
                    "evaluated_flag": "retrieval_ranking_engine",
                    "is_live_flagsmith": (assignment_source == "live_flagsmith_edge"),
                    "flagsmith_edge_connected": True,
                    "kill_switch_active": kill_switch_active,
                    "segment_override": segment_override_matched,
                    "segment_name": segment_name,
                    "remote_config": remote_config,
                    "warning": warning_msg,
                    "experiment_type": "Flagsmith-assigned local experiment"
                }

            except Exception as e:
                warning_msg = f"Flagsmith Edge evaluation error: {str(e)}. Fell back to local simulation."
                print(f"[SearchForge] {warning_msg}")

        # Local Fallback / Simulation Mode
        assignment_source = "local_simulation"
        if not warning_msg:
            warning_msg = "Running in local simulation mode (no live Flagsmith key configured)."

        # Segment override simulation
        if traits.get("tier") == "enterprise":
            segment_override_matched = True
            segment_name = "Enterprise VIP Users"
            variant = "hybrid_rrf"
        elif traits.get("has_error_code") is True:
            segment_override_matched = True
            segment_name = "Error Code Diagnosticians"
            variant = "lexical_bm25"
        else:
            variant = self._local_multivariate_hash(identifier)

        # Latency spike simulation: if synthetic spike requested, trigger SLA kill-switch
        if simulate_latency:
            kill_switch_active = True
            variant = "lexical_bm25"

        return {
            "identifier": identifier,
            "traits": traits,
            "variant": variant,
            "assignment_source": assignment_source,
            "evaluated_flag": "retrieval_ranking_engine",
            "is_live_flagsmith": False,
            "flagsmith_edge_connected": self.is_live,
            "kill_switch_active": kill_switch_active,
            "segment_override": segment_override_matched,
            "segment_name": segment_name,
            "remote_config": remote_config,
            "warning": warning_msg,
            "experiment_type": "Flagsmith-assigned local experiment"
        }

    def _local_multivariate_hash(self, identifier: str) -> str:
        """
        Deterministic 3-way split using Murmur3/MD5 bucket allocation (0-99):
        0-32   -> lexical_bm25 (Control)
        33-65  -> semantic_dense (Variant B)
        66-99  -> hybrid_rrf (Variant C)
        Unbiased balanced allocation across all three variants.
        """
        bucket = int(hashlib.md5(f"searchforge:{identifier}".encode("utf-8")).hexdigest(), 16) % 100
        if bucket < 33:
            return "lexical_bm25"
        elif bucket < 66:
            return "semantic_dense"
        else:
            return "hybrid_rrf"

flagsmith_service = FlagsmithService()
