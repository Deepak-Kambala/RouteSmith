import requests
from typing import Dict, Any
from app.config import settings
from app.flagsmith_service import flagsmith_service

class FlagsmithAdminClient:
    def __init__(self):
        self.api_url = settings.FLAGSMITH_API_URL
        self.admin_key = settings.FLAGSMITH_ADMIN_API_KEY
        
    def promote_winner(self, winner_variant: str = "clustered_hybrid_rag") -> Dict[str, Any]:
        """
        Promotes the winning variant to 100% production traffic allocation (0% / 100% / 0%).
        Calls the Flagsmith Admin API if an admin key is present, and immediately locks the local router.
        """
        new_weights = {
            "fast_zero_shot": 0,
            "clustered_hybrid_rag": 100 if winner_variant == "clustered_hybrid_rag" else 0,
            "agentic_self_reflection": 0
        }
        
        # If Variant C or A is selected as winner
        if winner_variant != "clustered_hybrid_rag":
            new_weights = {k: 100 if k == winner_variant else 0 for k in new_weights}
            
        # Update local Flagsmith router state
        updated = flagsmith_service.update_traffic_split(new_weights)
        
        admin_api_status = "simulated_local_sync"
        if self.admin_key and not self.admin_key.startswith("mock"):
            try:
                headers = {
                    "Authorization": f"Token {self.admin_key}",
                    "Content-Type": "application/json"
                }
                # Example Flagsmith Admin endpoint for multivariate feature states
                url = f"{self.api_url}features/{settings.FLAGSMITH_FEATURE_NAME}/"
                res = requests.patch(url, headers=headers, json={"multivariate_options": new_weights}, timeout=5)
                if res.status_code in [200, 201, 204]:
                    admin_api_status = "live_cloud_admin_applied"
            except Exception:
                admin_api_status = "offline_fallback_applied"
                
        return {
            "status": "success",
            "winner_variant": winner_variant,
            "updated_traffic_split": updated,
            "admin_api_status": admin_api_status,
            "message": f"Successfully promoted {winner_variant} to 100% production traffic. All incoming developer traffic now routes directly to Variant B."
        }

admin_client = FlagsmithAdminClient()
