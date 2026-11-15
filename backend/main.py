"""
SearchForge - Backend API (Track 01 Compliant)
Zero-API-cost, real-time Hybrid Search & Reciprocal Rank Fusion (RRF)
Bayesian Experimentation Workbench powered by Flagsmith.

Strictly decouples:
  1. Flagsmith-assigned User A/B Experimentation (Snippets copied / Search sessions)
  2. Offline Retrieval Benchmark (Recall@3, MRR@3 on 150-query curated dataset)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from flagsmith_client import flagsmith_service
from search_engine import search_engine
from bayesian import user_experiment_engine, offline_benchmark_engine

app = FastAPI(
    title="SearchForge API",
    description="Real-time Hybrid Search & RRF Bayesian Experimentation Workbench powered by Flagsmith",
    version="2.1.0"
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
    session_id: Optional[str] = "sess_demo_01"
    user_id: Optional[str] = "dev_session_01"
    traits: Optional[Dict[str, Any]] = None
    simulate_latency: Optional[bool] = False

class ConversionRequest(BaseModel):
    session_id: str
    doc_id: str
    rank: int = 1

class ScenarioRequest(BaseModel):
    scenario: str  # "inconclusive_low_sample" | "sdk_exact_bm25_wins" | "mixed_traffic_hybrid_wins" | "reset"


# --- Core Endpoints ---

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "SearchForge",
        "question": "Which ranking strategy helps developers find and use the right documentation?",
        "primary_metric": "Snippet Copy Rate (Proxy for Usefulness)",
        "flagsmith": flagsmith_service.get_status()
    }

@app.get("/api/config")
def get_config():
    """Returns connection mode, active Flagsmith feature flag, and remote config values."""
    return flagsmith_service.get_status()

@app.post("/api/config/key")
def update_key(req: KeyUpdateRequest):
    """Dynamically reconfigures the Flagsmith environment key at runtime without restarting."""
    status = flagsmith_service.update_key(req.environment_key)
    return {
        "success": True,
        "message": f"Flagsmith key updated. Active mode: {status['mode']}",
        "status": status
    }

@app.post("/api/search")
def search(req: SearchRequest):
    """
    Evaluates identity traits through Flagsmith (or local simulation),
    runs BM25, Dense Semantic SVD, and Hybrid RRF pipelines in <5ms,
    and returns rank diff cards with an auditable Flagsmith evaluation trail.
    Records search session exposure once per unique session_id.
    """
    session_id = req.session_id or "sess_demo_01"
    
    # 1. Flagsmith Identity & Trait Evaluation
    flag_eval = flagsmith_service.evaluate_identity(
        identifier=req.user_id or session_id,
        traits=req.traits or {},
        simulate_latency=bool(req.simulate_latency)
    )

    active_variant = flag_eval["variant"]
    assignment_source = flag_eval["assignment_source"]
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

    # 3. Record session exposure in user experiment engine (deduplicated per session)
    exposure_audit = user_experiment_engine.record_search_exposure(
        session_id=session_id,
        variant=active_variant,
        assignment_source=assignment_source,
        query=req.query
    )

    return {
        "flagsmith": flag_eval,
        "search": search_res,
        "exposure": exposure_audit,
        "latency_ms": search_res["latency_ms"]
    }

@app.post("/api/conversion")
def record_conversion(req: ConversionRequest):
    """
    Records 'doc_snippet_resolved' event when user copies code snippet,
    strictly attributed to the variant served to that session.
    Enforces maximum 1 conversion per session to prevent duplicate inflation.
    """
    audit = user_experiment_engine.record_snippet_copy(
        session_id=req.session_id,
        doc_id=req.doc_id,
        rank=req.rank
    )
    return {
        "success": audit["success"],
        "duplicate": audit.get("duplicate", False),
        "message": audit["message"],
        "attributed_variant": audit.get("variant"),
        "state": user_experiment_engine.get_state()
    }

# --- Mode A: User A/B Experimentation Endpoints ---

@app.get("/api/experiment/state")
def get_experiment_state():
    """
    Returns user experiment state: sample sizes, credible intervals,
    win probabilities, uncertainty status, and Beta distribution curves.
    Never fabricates a winner when sample size is insufficient.
    """
    return user_experiment_engine.get_state()

@app.post("/api/experiment/simulate")
def simulate_traffic(req: ScenarioRequest):
    """
    Injects clearly-labeled demo scenarios:
      - 'inconclusive_low_sample': Small pilot (N=12), demonstrates 'Not Enough Evidence'.
      - 'sdk_exact_bm25_wins': Exact code searches, demonstrates BM25 CONTROL WINNING (proves no rigging).
      - 'mixed_traffic_hybrid_wins': Representative mixed traffic, demonstrates Hybrid RRF winning.
      - 'reset': Clears all sessions to pristine N=0 state.
    """
    state = user_experiment_engine.inject_traffic_scenario(req.scenario)
    return {
        "success": True,
        "scenario": req.scenario,
        "state": state
    }

@app.post("/api/experiment/reset")
def reset_experiment():
    """Resets user experiment to pristine N=0 state with uniform Beta(1, 1) prior."""
    user_experiment_engine.reset()
    return {
        "success": True,
        "message": "Reset all experiment sessions to zero evidence.",
        "state": user_experiment_engine.get_state()
    }

# --- Mode B: Offline Retrieval Benchmark Endpoints ---

@app.get("/api/benchmark/results")
def run_offline_benchmark():
    """
    Executes offline evaluation over the curated 150-query developer dataset.
    Computes Recall@1, Recall@3, MRR@3, and average latency across all 3 variants.
    Completely isolated from the User Experiment.
    """
    return offline_benchmark_engine.run_benchmark()

@app.get("/api/telemetry")
def get_telemetry():
    """Returns recent evaluation and session telemetry logs."""
    return {
        "telemetry": user_experiment_engine.telemetry_log
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
