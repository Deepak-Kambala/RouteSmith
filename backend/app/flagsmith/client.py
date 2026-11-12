import hashlib
from typing import Dict, Any, Optional
from app.config import settings

class FlagsmithService:
    def __init__(self):
        self.use_live = bool(settings.flagsmith_environment_key)
        self.flagsmith_client = None

        if self.use_live:
            try:
                from flagsmith import Flagsmith
                self.flagsmith_client = Flagsmith(
                    environment_key=settings.flagsmith_environment_key,
                    api_url=settings.flagsmith_api_url
                )
            except Exception as e:
                print(f"Warning: Could not initialize Flagsmith live client: {e}. Falling back to deterministic engine.")
                self.use_live = False

    def evaluate_identity(self, identifier: str, flag_key: str, default_split: int = 50) -> Dict[str, Any]:
        """
        Evaluates feature flag for a pseudonymous identifier.
        Uses Murmur3-style deterministic MD5 bucket assignment (0-99).
        """
        if self.use_live and self.flagsmith_client:
            try:
                identity_flags = self.flagsmith_client.get_identity_flags(identifier=identifier)
                is_enabled = identity_flags.is_feature_enabled(flag_key)
                feature_value = identity_flags.get_feature_value(flag_key)
                return {
                    "identifier": identifier,
                    "flag_key": flag_key,
                    "is_enabled": is_enabled,
                    "assigned_variant": "treatment" if is_enabled else "control",
                    "feature_value": feature_value,
                    "mode": "flagsmith_cloud_edge"
                }
            except Exception as err:
                print(f"Live Flagsmith evaluation error: {err}")

        # Deterministic 100-bucket hash fallback
        hash_val = int(hashlib.md5(f"{identifier}:{flag_key}".encode("utf-8")).hexdigest(), 16) % 100
        is_treatment = hash_val < default_split

        return {
            "identifier": identifier,
            "flag_key": flag_key,
            "is_enabled": is_treatment,
            "assigned_variant": "treatment" if is_treatment else "control",
            "bucket": hash_val,
            "mode": "deterministic_murmur3_engine"
        }

flagsmith_service = FlagsmithService()
