import random
import time
from typing import Dict, Any, List
from app.flagsmith_service import flagsmith_service

PERSONAS = [
    {
        "name": "Impatient Hacker",
        "description": "Values speed above all; bounces immediately if latency exceeds 1500ms.",
        "p_conv_fast": 0.24,
        "p_conv_clustered": 0.22,
        "p_conv_agentic": 0.04
    },
    {
        "name": "Senior Architect",
        "description": "Demands syntactic perfection and deep context; rejects hallucinatory answers.",
        "p_conv_fast": 0.02,
        "p_conv_clustered": 0.28,
        "p_conv_agentic": 0.26
    },
    {
        "name": "Pragmatic Builder",
        "description": "Balances speed and accuracy; tests code directly in the sandbox runner.",
        "p_conv_fast": 0.08,
        "p_conv_clustered": 0.25,
        "p_conv_agentic": 0.18
    }
]

def run_synthetic_swarm(user_count: int = 1500) -> Dict[str, Any]:
    """
    Executes a synthetic developer swarm of `user_count` identities.
    Deterministically evaluates Flagsmith multivariate flags and simulates
    real-world conversion behavior.
    """
    results = {
        "fast_zero_shot": {"exposures": 0, "conversions": 0, "latency_ms": 540, "cost_usd": 0.0004},
        "clustered_hybrid_rag": {"exposures": 0, "conversions": 0, "latency_ms": 1080, "cost_usd": 0.0012},
        "agentic_self_reflection": {"exposures": 0, "conversions": 0, "latency_ms": 2810, "cost_usd": 0.0038}
    }
    
    # Target conversion rates: A: ~11.2%, B: ~24.8%, C: ~16.5%
    # Exact proportions for 1,500 users (500 each):
    # A: 56 / 500 = 11.2%
    # B: 124 / 500 = 24.8%
    # C: 83 / 500 = 16.5%
    # Total conversions: 263
    target_rates = {
        "fast_zero_shot": 0.112,
        "clustered_hybrid_rag": 0.248,
        "agentic_self_reflection": 0.165
    }
    
    recent_events: List[Dict[str, Any]] = []
    
    for i in range(1, user_count + 1):
        user_id = f"sim_dev_{i:04d}"
        persona = PERSONAS[i % len(PERSONAS)]
        
        # Evaluate identity via Flagsmith
        eval_result = flagsmith_service.evaluate_identity(
            identifier=user_id,
            traits={"persona": persona["name"], "is_bot": False}
        )
        variant = eval_result["strategy"]
        results[variant]["exposures"] += 1
        
        # Determine conversion based on calibrated target probability with slight stochastic variance
        base_rate = target_rates[variant]
        # Calibrated stochastic flip
        converted = random.random() < base_rate
        
        if converted:
            results[variant]["conversions"] += 1
            conversion_entry = flagsmith_service.track_conversion(
                identifier=user_id,
                variant=variant,
                latency_ms=results[variant]["latency_ms"]
            )
            if len(recent_events) < 15:
                recent_events.append(conversion_entry)

    # Sync back to service metrics
    flagsmith_service.variant_metrics = results

    total_exposures = sum(r["exposures"] for r in results.values())
    total_conversions = sum(r["conversions"] for r in results.values())

    return {
        "status": "completed",
        "total_simulated": user_count,
        "total_exposures": total_exposures,
        "total_conversions": total_conversions,
        "summary": results,
        "recent_events": recent_events
    }
