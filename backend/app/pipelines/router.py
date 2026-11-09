from typing import Dict, Any
from app.pipelines.fast_zero_shot import execute_fast_zero_shot
from app.pipelines.clustered_hybrid_rag import execute_clustered_hybrid_rag
from app.pipelines.agentic_cot import execute_agentic_cot

def route_rag_pipeline(strategy: str, query: str, max_tokens: int = 2048) -> Dict[str, Any]:
    """Dynamically routes execution to the pipeline assigned by Flagsmith."""
    if strategy == "fast_zero_shot":
        return execute_fast_zero_shot(query, max_tokens)
    elif strategy == "clustered_hybrid_rag":
        return execute_clustered_hybrid_rag(query, max_tokens)
    elif strategy == "agentic_self_reflection":
        return execute_agentic_cot(query, max_tokens)
    else:
        # Fallback to clustered hybrid
        return execute_clustered_hybrid_rag(query, max_tokens)
