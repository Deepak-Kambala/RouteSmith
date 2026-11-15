"""
SearchForge Flagsmith Client Service
Wraps official Flagsmith Edge SDK with local fallback, runtime key reconfiguration,
identity trait evaluation, remote config extraction, and kill-switch state.
"""

import os
import hashlib
from typing import Dict, Any, Optional

class FlagsmithService:
    def __init__(self, environment_key: Optional[str] = None):
        self.environment_key = environment_key or os.getenv("FLAGSMITH_ENVIRONMENT_KEY", "")
        self.api_url = os.getenv("FLAGSMITH_API_URL", "https://edge.api.flagsmith.com/api/v1/")
        self.client = None
        self.is_live = False
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
                # Verify edge connection
                flags = self.client.get_environment_flags()
                self.is_live = True
                print(f"[SearchForge] Connected to live Flagsmith Edge API with key: {self.get_masked_key()}")
            except Exception as e:
                print(f"[SearchForge] Live Flagsmith initialization failed: {e}. Running local simulation.")
                self.client = None
                self.is_live = False
        else:
            self.client = None
            self.is_live = False
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
            "mode": "live_edge_sdk" if self.is_live else "local_fallback",
            "environment_key_masked": self.get_masked_key(),
            "api_url": self.api_url,
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

        if self.is_live and self.client:
            try:
                identity_flags = self.client.get_identity_flags(identifier=identifier, traits=traits)
                
                # Check kill-switch flag
                kill_switch_active = identity_flags.is_feature_enabled("force_lexical_fallback")
                
                # Check ranking variant
                variant_val = identity_flags.get_feature_value("retrieval_ranking_engine")
                if variant_val in ["lexical_bm25", "semantic_dense", "hybrid_rrf"]:
                    variant = variant_val
                else:
                    # Fallback to local multivariate hash
                    variant = self._local_multivariate_hash(identifier)

                # Read remote config overrides if present
                for param in remote_config.keys():
                    val = identity_flags.get_feature_value(f"retrieval_ranking_engine_{param}")
                    if val is not None:
                        try:
                            remote_config[param] = float(val)
                        except (ValueError, TypeError):
                            pass

                # Detect segment override
                if traits.get("tier") == "enterprise":
                    segment_override_matched = True
                    segment_name = "Enterprise VIP Users"
                elif traits.get("has_error_code") is True:
                    segment_override_matched = True
                    segment_name = "Error Code Diagnosticians"

                return {
                    "identifier": identifier,
                    "traits": traits,
                    "variant": "lexical_bm25" if kill_switch_active else variant,
                    "kill_switch_active": kill_switch_active,
                    "segment_override": segment_override_matched,
                    "segment_name": segment_name,
                    "remote_config": remote_config,
                    "mode": "live_flagsmith_edge"
                }
            except Exception as e:
                print(f"[SearchForge] Edge evaluation error: {e}. Falling back to local simulation.")

        # Local Fallback Mode
        # Segment overrides simulation
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
            "kill_switch_active": kill_switch_active,
            "segment_override": segment_override_matched,
            "segment_name": segment_name,
            "remote_config": remote_config,
            "mode": "local_fallback"
        }

    def _local_multivariate_hash(self, identifier: str) -> str:
        """
        Deterministic 3-way split using Murmur3/MD5 bucket allocation (0-99):
        0-33   -> lexical_bm25 (Control)
        34-66  -> semantic_dense (Variant B)
        67-99  -> hybrid_rrf (Variant C - Winner)
        """
        bucket = int(hashlib.md5(f"searchforge:{identifier}".encode("utf-8")).hexdigest(), 16) % 100
        if bucket < 33:
            return "lexical_bm25"
        elif bucket < 66:
            return "semantic_dense"
        else:
            return "hybrid_rrf"

flagsmith_service = FlagsmithService()
