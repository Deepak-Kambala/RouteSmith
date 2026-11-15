"""
SearchForge - Backend API
Zero-API-cost, real-time Hybrid Search & Reciprocal Rank Fusion (RRF)
Bayesian Experimentation Workbench powered by Flagsmith.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from flagsmith_client import flagsmith_service
from search_engine import search_engine
from bayesian import bayesian_engine

app = FastAPI(
    title="SearchForge API",
    description="Real-time Hybrid Search & RRF Bayesian Experimentation Workbench powered by Flagsmith",
    version="2.0.0"
)

# CORS enabled for local development & iframe embeds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Request Models ---
class KeyUpdateRequest(BaseModel):
    environment_key: str

class SearchRequest(BaseModel):
    query: str
    user_id: Optional[str] = "dev_session_01"
    traits: Optional[Dict[str, Any]] = None
    simulate_latency: Optional[bool] = False

class ConversionRequest(BaseModel):
    variant: str
    doc_id: str
    rank: int = 1
    user_id: Optional[str] = "dev_session_01"


# --- Endpoints ---

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "SearchForge",
        "flagsmith": flagsmith_service.get_status()
    }

@app.get("/api/config")
def get_config():
    """Returns connection mode, active Flagsmith feature flag, and remote config HUD values."""
    return flagsmith_service.get_status()

@app.post("/api/config/key")
def update_key(req: KeyUpdateRequest):
    """Dynamically reconfigures the Flagsmith environment key at runtime without restarting."""
    status = flagsmith_service.update_key(req.environment_key)
    return {
        "success": True,
        "message": f"Updated Flagsmith key. Active mode: {status['mode']}",
        "status": status
    }

@app.post("/api/search")
def search(req: SearchRequest):
    """
    Evaluates identity traits through Flagsmith (or local fallback),
    runs BM25, Dense Semantic SVD, and Hybrid RRF pipelines in <5ms,
    and returns rank diff cards with Flagsmith evaluation metadata.
    """
    # 1. Flagsmith Identity & Trait Evaluation
    flag_eval = flagsmith_service.evaluate_identity(
        identifier=req.user_id or "dev_session_01",
        traits=req.traits or {},
        simulate_latency=bool(req.simulate_latency)
    )

    active_variant = flag_eval["variant"]
    remote_cfg = flag_eval["remote_config"]

    # 2. Search Retrieval Pipeline
    search_res = search_engine.search(
        query=req.query,
        variant=active_variant,
        alpha=remote_cfg.get("alpha", 0.45),
        rrf_k=int(remote_cfg.get("rrf_k", 60)),
        code_boost=remote_cfg.get("code_boost", 1.35),
        simulate_latency=bool(req.simulate_latency)
    )

    # 3. Record exposure in Bayesian engine
    bayesian_engine.record_exposure(active_variant)

    return {
        "flagsmith": flag_eval,
        "search": search_res,
        "latency_ms": search_res["latency_ms"]
    }

@app.post("/api/conversion")
def record_conversion(req: ConversionRequest):
    """
    Records 'doc_snippet_resolved' event when user copies code snippet,
    updating the live Bayesian posterior for the active variant.
    """
    bayesian_engine.record_conversion(
        variant=req.variant,
        hit_rank=req.rank,
        user_id=req.user_id or "dev_session_01"
    )
    return {
        "success": True,
        "event": "doc_snippet_resolved",
        "state": bayesian_engine.get_state()
    }

@app.get("/api/bayesian/state")
def get_bayesian_state():
    """Returns comparison matrix, 95% Credible Intervals, win probabilities, and Beta curves."""
    return bayesian_engine.get_state()

@app.post("/api/bayesian/benchmark")
def run_benchmark():
    """Streams 150 real ground-truth developer queries through the 3 variants."""
    state = bayesian_engine.run_benchmark_stream(150)
    return {
        "success": True,
        "queries_evaluated": 150,
        "state": state
    }

@app.post("/api/bayesian/reset")
def reset_bayesian():
    """Resets posteriors to flat Beta(1, 1) prior."""
    bayesian_engine.reset()
    return {
        "success": True,
        "message": "Reset all variants to uniform prior Beta(1, 1).",
        "state": bayesian_engine.get_state()
    }

@app.get("/api/telemetry")
def get_telemetry():
    """Returns recent evaluation logs."""
    return {
        "telemetry": bayesian_engine.telemetry_log
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
