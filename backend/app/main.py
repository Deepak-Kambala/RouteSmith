import time
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.config import settings
from app.flagsmith_service import flagsmith_service
from app.pipelines.router import route_rag_pipeline
from app.simulator.swarm_worker import run_synthetic_swarm
from app.simulator.bayesian_math import compute_bayesian_posteriors
from app.admin_api import admin_client
from app.docs.doc_manager import doc_manager

app = FastAPI(
    title="RouteSmith AI Backend",
    description="Self-Optimizing LLM Gateway & AI Docs Assistant Powered by Flagsmith Bayesian Experimentation",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    query: str
    user_tier: Optional[str] = "pro"

class TrackEventRequest(BaseModel):
    user_id: str
    variant: str
    metric: Optional[str] = "answer_resolved"
    latency_ms: Optional[int] = 1080

class SwarmRequest(BaseModel):
    user_count: Optional[int] = 1500

class PromoteRequest(BaseModel):
    winner_variant: Optional[str] = "clustered_hybrid_rag"

class AddDocRequest(BaseModel):
    title: str
    content: str
    category: Optional[str] = "Custom Data"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RouteSmith AI",
        "flagsmith_mode": "cloud_sdk" if flagsmith_service.use_live else "deterministic_engine",
        "traffic_weights": flagsmith_service.traffic_weights,
        "docs_count": len(doc_manager.get_all())
    }

@app.get("/api/flags")
def get_identity_flags(user_id: str = Query(..., description="Developer identity UUID"), tier: str = "pro"):
    """Evaluates Flagsmith multivariate flag and guardrails for specific identity."""
    eval_result = flagsmith_service.evaluate_identity(
        identifier=user_id,
        traits={"user_tier": tier}
    )
    return eval_result

@app.post("/api/chat")
def ask_docs_copilot(req: ChatRequest):
    """
    RAG Gateway Endpoint:
    1. Evaluates Flagsmith multivariate flag for user_id
    2. Dynamically routes to the corresponding RAG execution pipeline
    """
    eval_result = flagsmith_service.evaluate_identity(
        identifier=req.user_id,
        traits={"user_tier": req.user_tier}
    )
    
    strategy = eval_result["strategy"]
    max_tokens = eval_result.get("max_context_tokens", 2048)
    
    pipeline_result = route_rag_pipeline(
        strategy=strategy,
        query=req.query,
        max_tokens=max_tokens
    )
    
    return {
        "user_id": req.user_id,
        "active_variant": strategy,
        "pipeline_title": pipeline_result.get("title"),
        "answer": pipeline_result.get("answer"),
        "code": pipeline_result.get("code"),
        "language": pipeline_result.get("language", "python"),
        "latency_ms": pipeline_result.get("latency_ms"),
        "cost_usd": pipeline_result.get("cost_usd"),
        "active_docs_count": pipeline_result.get("active_docs_count"),
        "flagsmith_eval": eval_result,
        "warning": pipeline_result.get("warning")
    }

@app.post("/api/track")
def track_conversion(req: TrackEventRequest):
    """Logs the primary 'answer_resolved' conversion event to Flagsmith."""
    event = flagsmith_service.track_conversion(
        identifier=req.user_id,
        variant=req.variant,
        metric=req.metric or "answer_resolved",
        latency_ms=req.latency_ms or 1080
    )
    return {"status": "tracked", "event": event}

@app.post("/api/simulator/run")
def trigger_swarm_simulation(req: SwarmRequest):
    """Runs a synthetic swarm of developer sessions against Flagsmith."""
    count = max(100, min(2000, req.user_count or 1500))
    swarm_result = run_synthetic_swarm(user_count=count)
    return swarm_result

@app.get("/api/bayesian-stats")
def get_bayesian_telemetry():
    """Computes Beta-Binomial posterior curves and win probabilities."""
    posteriors = compute_bayesian_posteriors(flagsmith_service.variant_metrics)
    return posteriors

@app.post("/api/admin/promote-winner")
def promote_winning_variant(req: PromoteRequest):
    """1-Click Winner Promotion to 100% production traffic via Flagsmith Admin API."""
    res = admin_client.promote_winner(req.winner_variant or "clustered_hybrid_rag")
    return res

@app.get("/api/docs")
def get_docs():
    """Returns all active documentation chunks."""
    return {"docs": doc_manager.get_all()}

@app.post("/api/docs")
def add_custom_doc(req: AddDocRequest):
    """Adds a custom document to the RAG knowledge base."""
    new_doc = doc_manager.add_doc(title=req.title, content=req.content, category=req.category or "Custom Data")
    return {"status": "added", "doc": new_doc, "total_docs": len(doc_manager.get_all())}

@app.post("/api/docs/reset")
def reset_docs():
    """Resets documentation back to default Flagsmith corpus."""
    docs = doc_manager.reset_to_defaults()
    return {"status": "reset", "total_docs": len(docs)}

@app.get("/api/telemetry/recent")
def get_recent_telemetry():
    """Returns the latest exposures and conversion events for the toast notification stream."""
    return {
        "exposures": flagsmith_service.exposure_events[-10:],
        "conversions": flagsmith_service.conversion_events[-10:]
    }
