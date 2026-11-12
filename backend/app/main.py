import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.config import settings
from app.database.store import store
from app.flagsmith.client import flagsmith_service
from app.analytics.stats_engine import stats_engine
from app.agent.orchestrator import agent_orchestrator

app = FastAPI(
    title="RouteSmith Backend API",
    description="AI-Powered Experimentation Engineer with Flagsmith Multivariate Routing and Bayesian Telemetry",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventTrackRequest(BaseModel):
    experiment_id: str
    variant_id: str
    event_type: str # 'exposure' | 'conversion'
    participant_id: str
    metadata: Optional[Dict[str, Any]] = None

class ToolExecutionRequest(BaseModel):
    tool_name: str
    params: Dict[str, Any]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RouteSmith",
        "flagsmith_mode": "cloud_sdk" if flagsmith_service.use_live else "deterministic_engine",
        "experiments_count": len(store.get_all_experiments())
    }

@app.get("/api/dashboard")
def get_dashboard():
    experiments = store.get_all_experiments()
    total_participants = sum(e["total_participants"] for e in experiments)
    active_count = len([e for e in experiments if e["status"] == "running"])
    completed_count = 8

    # Calculate average conversion rate
    all_rates = []
    for e in experiments:
        for v in e["variants"]:
            if v["type"] == "treatment":
                all_rates.append(v["conversion_rate"])
    avg_rate = round(sum(all_rates) / (len(all_rates) or 1), 1)

    return {
        "active_experiments_count": active_count,
        "total_participants_count": total_participants,
        "average_conversion_rate": avg_rate,
        "completed_experiments_count": completed_count,
        "activity_series": [
            {"date": "May 01", "exposures": 840, "conversions": 120},
            {"date": "May 03", "exposures": 1120, "conversions": 184},
            {"date": "May 05", "exposures": 1430, "conversions": 245},
            {"date": "May 07", "exposures": 1680, "conversions": 310},
            {"date": "May 09", "exposures": 2100, "conversions": 405},
            {"date": "May 11", "exposures": 2350, "conversions": 480},
        ],
        "recent_agent_actions": [
            {"id": "1", "action": "Repository analysed", "target": "Deepak-Kambala/RouteSmith", "time_ago": "12m ago", "type": "analysis"},
            {"id": "2", "action": "Hypothesis generated", "target": "Signup Flow Simplification", "time_ago": "28m ago", "type": "hypothesis"},
            {"id": "3", "action": "Feature flag created", "target": "signup_form_simplification", "time_ago": "1h ago", "type": "flag"},
            {"id": "4", "action": "Experiment launched", "target": "Sticky Trial Navbar CTA", "time_ago": "3h ago", "type": "launch"},
            {"id": "5", "action": "Results analysed", "target": "Pricing Annual Toggle", "time_ago": "5h ago", "type": "results"},
        ],
        "recent_experiments": experiments
    }

@app.get("/api/experiments")
def list_experiments():
    return store.get_all_experiments()

@app.get("/api/experiments/{experiment_id}")
def get_experiment(experiment_id: str):
    exp = store.get_experiment_by_id(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@app.post("/api/events/track")
def track_event(req: EventTrackRequest):
    event = store.add_event(
        exp_id=req.experiment_id,
        variant_id=req.variant_id,
        event_type=req.event_type,
        participant_id=req.participant_id
    )
    return {
        "success": True,
        "event": event
    }

@app.get("/api/flags/evaluate")
def evaluate_flag(identifier: str = Query(...), flag_key: str = Query("signup_form_simplification")):
    return flagsmith_service.evaluate_identity(identifier=identifier, flag_key=flag_key)

@app.get("/api/repositories")
def list_repositories():
    return store.repositories

@app.get("/api/integrations")
def get_integrations():
    return {
        "github": {
            "connected": True,
            "username": "Deepak-Kambala",
            "repo_access_count": 4
        },
        "flagsmith": {
            "connected": True,
            "environment": "production-core",
            "mode": "cloud_sdk" if flagsmith_service.use_live else "deterministic_engine",
            "project_id": "routesmith-core"
        },
        "gemini": {
            "configured": True,
            "model": "gemini-2.0-flash"
        }
    }

class AgentChatRequest(BaseModel):
    message: str
    repository: Optional[str] = "Deepak-Kambala/RouteSmith"

class ExperimentProposeRequest(BaseModel):
    objective: str
    repository: Optional[str] = "Deepak-Kambala/RouteSmith"

@app.post("/api/agent/chat")
async def agent_chat(req: AgentChatRequest):
    result = await agent_orchestrator.chat(user_goal=req.message, repo=req.repository)
    return result

@app.post("/api/experiments/propose")
async def propose_experiment(req: ExperimentProposeRequest):
    result = await agent_orchestrator.chat(user_goal=req.objective, repo=req.repository)
    return {
        "name": f"A/B Test: {req.objective[:40]}",
        "hypothesis": result.get("reasoning_summary", "Optimizing the component lowers drop-off and drives higher conversion."),
        "control_variant": {
            "name": "Variant A (Control)",
            "description": "Existing baseline implementation with standard inputs and layout."
        },
        "treatment_variant": {
            "name": "Variant B (Treatment)",
            "description": result.get("reasoning_summary", "Streamlined treatment variation with reduced friction.")
        },
        "primary_metric": "conversion_success",
        "secondary_metrics": "dwell_time_seconds, click_through_rate",
        "target_audience": "100% eligible traffic (50/50 split)",
        "potential_risks": "Requires monitoring initial downstream event telemetry.",
        "suggested_duration": "14 days",
        "feature_flag_key": result.get("flag_key", "exp_feature_flag"),
        "code_diff": result.get("code_diff")
    }

@app.post("/api/agent/tools/execute")
async def execute_agent_tool(req: ToolExecutionRequest):
    result = await agent_orchestrator.execute_tool(req.tool_name, req.params)
    return result

