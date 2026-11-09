import hashlib
import time
from typing import Dict, Any, List, Optional
from app.config import settings

try:
    from flagsmith import Flagsmith
    FLAGSMITH_LIB_AVAILABLE = True
except ImportError:
    FLAGSMITH_LIB_AVAILABLE = False

class FlagsmithService:
    def __init__(self):
        self.live_client: Optional[Any] = None
        self.use_live = False
        
        # In-memory traffic weights for multivariate flag: rag_pipeline_strategy
        # Can be dynamically changed via Admin API (e.g. 0/100/0 on winner promotion)
        self.traffic_weights = {
            "fast_zero_shot": 33,
            "clustered_hybrid_rag": 33,
            "agentic_self_reflection": 34
        }
        
        # Telemetry logs and aggregate stats
        self.exposure_events: List[Dict[str, Any]] = []
        self.conversion_events: List[Dict[str, Any]] = []
        
        # Cumulative metrics by variant
        self.variant_metrics = {
            "fast_zero_shot": {"exposures": 500, "conversions": 56, "latency_ms": 540, "cost_usd": 0.0004},
            "clustered_hybrid_rag": {"exposures": 500, "conversions": 124, "latency_ms": 1080, "cost_usd": 0.0012},
            "agentic_self_reflection": {"exposures": 500, "conversions": 83, "latency_ms": 2810, "cost_usd": 0.0038}
        }
        
        # Attempt live Flagsmith connection if a valid live key is present
        if FLAGSMITH_LIB_AVAILABLE and settings.FLAGSMITH_ENVIRONMENT_KEY and not settings.FLAGSMITH_ENVIRONMENT_KEY.startswith("ser.mock"):
            try:
                self.live_client = Flagsmith(
                    environment_key=settings.FLAGSMITH_ENVIRONMENT_KEY,
                    enable_analytics=True
                )
                self.use_live = True
            except Exception as e:
                self.use_live = False

    def evaluate_identity(self, identifier: str, traits: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Evaluates identity flags and logs exposure."""
        traits = traits or {"user_tier": "pro", "region": "us-east"}
        
        if self.use_live and self.live_client:
            try:
                identity_flags = self.live_client.get_identity_flags(identifier=identifier, traits=traits)
                strategy = identity_flags.get_feature_value(settings.FLAGSMITH_FEATURE_NAME)
                cache_enabled = identity_flags.is_feature_enabled(settings.FLAG_ENABLE_SEMANTIC_CACHE)
                max_tokens = identity_flags.get_feature_value(settings.FLAG_MAX_CONTEXT_TOKENS) or 2048
                
                exposure_entry = {
                    "event": "EXPOSURE",
                    "identifier": identifier,
                    "variant": strategy,
                    "timestamp": time.time(),
                    "source": "flagsmith_cloud_sdk"
                }
                self.exposure_events.append(exposure_entry)
                
                return {
                    "identifier": identifier,
                    "traits": traits,
                    "strategy": strategy,
                    "enable_semantic_cache": cache_enabled,
                    "max_context_tokens": int(max_tokens),
                    "source": "live_flagsmith_cloud"
                }
            except Exception:
                pass
                
        # Deterministic hashing engine matching Flagsmith's bucketing algorithm
        hash_val = int(hashlib.md5(identifier.encode("utf-8")).hexdigest(), 16) % 100
        
        w_a = self.traffic_weights["fast_zero_shot"]
        w_b = self.traffic_weights["clustered_hybrid_rag"]
        
        if hash_val < w_a:
            selected_variant = "fast_zero_shot"
        elif hash_val < (w_a + w_b):
            selected_variant = "clustered_hybrid_rag"
        else:
            selected_variant = "agentic_self_reflection"
            
        exposure_entry = {
            "event": "EXPOSURE",
            "identifier": identifier,
            "variant": selected_variant,
            "timestamp": time.time(),
            "source": "flagsmith_deterministic_engine"
        }
        self.exposure_events.append(exposure_entry)
        if len(self.exposure_events) > 200:
            self.exposure_events.pop(0)
            
        return {
            "identifier": identifier,
            "traits": traits,
            "strategy": selected_variant,
            "enable_semantic_cache": True,
            "max_context_tokens": 2048,
            "source": "flagsmith_deterministic_engine",
            "traffic_weights": self.traffic_weights
        }

    def track_conversion(self, identifier: str, variant: str, metric: str = "answer_resolved", latency_ms: int = 1080) -> Dict[str, Any]:
        """Tracks verified conversion event with telemetry logging."""
        if self.use_live and self.live_client:
            try:
                self.live_client.track_event(identifier=identifier, event_name=metric)
            except Exception:
                pass
                
        conversion_entry = {
            "event": "EVENT_TRACKED",
            "metric": metric,
            "identifier": identifier,
            "variant": variant,
            "latency_ms": latency_ms,
            "value": 1,
            "timestamp": time.time()
        }
        self.conversion_events.append(conversion_entry)
        if len(self.conversion_events) > 200:
            self.conversion_events.pop(0)
            
        if variant in self.variant_metrics:
            self.variant_metrics[variant]["conversions"] += 1
            
        return conversion_entry

    def update_traffic_split(self, new_weights: Dict[str, int]) -> Dict[str, int]:
        """Dynamically updates traffic weights (e.g. 0/100/0 on winner promotion)."""
        self.traffic_weights = new_weights
        return self.traffic_weights

flagsmith_service = FlagsmithService()
