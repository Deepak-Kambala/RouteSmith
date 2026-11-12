import time
from typing import Dict, List, Any, Optional

class DataStore:
    def __init__(self):
        # Default seed repositories
        self.repositories: List[Dict[str, Any]] = [
            {
                "id": "repo_1",
                "name": "RouteSmith",
                "owner": "Deepak-Kambala",
                "default_branch": "main",
                "last_analyzed_commit": "11157e5",
                "experiment_count": 3,
                "connection_status": "connected",
                "component_count": 24,
                "route_count": 8,
                "detected_framework": "Next.js 16 (App Router) + FastAPI",
            },
            {
                "id": "repo_2",
                "name": "acme-saas-frontend",
                "owner": "Deepak-Kambala",
                "default_branch": "production",
                "last_analyzed_commit": "8f42d10",
                "experiment_count": 1,
                "connection_status": "connected",
                "component_count": 42,
                "route_count": 14,
                "detected_framework": "React 19 + Vite",
            }
        ]

        # Default seed experiments
        self.experiments: List[Dict[str, Any]] = [
            {
                "id": "exp_signup_v2",
                "name": "Simplified 3-Field Signup Flow",
                "objective": "Increase mobile & desktop registration completion rate",
                "hypothesis": "Removing optional company size and job title fields reduces friction by 25%",
                "repository_id": "repo_1",
                "repository_name": "Deepak-Kambala/RouteSmith",
                "branch": "main",
                "status": "running",
                "feature_flag_key": "signup_form_simplification",
                "total_participants": 3420,
                "created_at": "2026-05-02T10:00:00Z",
                "updated_at": "2026-05-11T16:00:00Z",
                "duration_days": 14,
                "variants": [
                    {
                        "id": "control",
                        "name": "Variant A (Control 6-field)",
                        "type": "control",
                        "weight": 50,
                        "description": "Standard 6-field registration form with company size and title",
                        "exposures": 1710,
                        "conversions": 205,
                        "conversion_rate": 12.0,
                    },
                    {
                        "id": "treatment",
                        "name": "Variant B (Treatment 3-field)",
                        "type": "treatment",
                        "weight": 50,
                        "description": "Streamlined 3-field registration form (Name, Work Email, Password)",
                        "exposures": 1710,
                        "conversions": 424,
                        "conversion_rate": 24.8,
                    },
                ],
                "metrics": {
                    "primary_metric": "signup_completed",
                    "secondary_metrics": ["time_to_complete_seconds", "activation_rate"],
                    "minimum_detectable_effect": 5.0,
                    "statistical_power": 0.8,
                    "confidence_level": 0.95,
                    "p_value": 0.0001,
                    "relative_lift": 106.7,
                    "is_significant": True,
                },
                "ai_recommendation": "Variant B demonstrates statistically significant superiority (+106.7% relative lift, p < 0.001). Recommend rolling out to 100% production traffic.",
            },
            {
                "id": "exp_cta_placement",
                "name": "Sticky Navigation CTA vs Hero Banner",
                "objective": "Maximize documentation copilot trial starts",
                "hypothesis": "A persistent navbar CTA maintains visual availability during long scroll sessions",
                "repository_id": "repo_1",
                "repository_name": "Deepak-Kambala/RouteSmith",
                "branch": "main",
                "status": "running",
                "feature_flag_key": "nav_sticky_cta_experiment",
                "total_participants": 5890,
                "created_at": "2026-05-06T12:00:00Z",
                "updated_at": "2026-05-11T14:30:00Z",
                "duration_days": 10,
                "variants": [
                    {
                        "id": "control",
                        "name": "Variant A (Hero only)",
                        "type": "control",
                        "weight": 50,
                        "description": "CTA placed strictly in hero banner",
                        "exposures": 2945,
                        "conversions": 412,
                        "conversion_rate": 14.0,
                    },
                    {
                        "id": "treatment",
                        "name": "Variant B (Sticky Navbar)",
                        "type": "treatment",
                        "weight": 50,
                        "description": "CTA stays fixed in top right navigation on scroll",
                        "exposures": 2945,
                        "conversions": 498,
                        "conversion_rate": 16.9,
                    },
                ],
                "metrics": {
                    "primary_metric": "trial_started",
                    "secondary_metrics": ["scroll_depth"],
                    "minimum_detectable_effect": 3.0,
                    "statistical_power": 0.8,
                    "confidence_level": 0.95,
                    "p_value": 0.012,
                    "relative_lift": 20.7,
                    "is_significant": True,
                },
                "ai_recommendation": "Early trend indicates positive lift (+20.7%), but sample size has reached 70% of target. Recommend running 3 more days for conclusive power.",
            },
            {
                "id": "exp_pricing_annual",
                "name": "Default Annual Billing Toggle with Savings Callout",
                "objective": "Increase average revenue per subscriber",
                "hypothesis": "Highlighting '2 Months Free' with preselected annual toggle lifts annual adoption",
                "repository_id": "repo_1",
                "repository_name": "Deepak-Kambala/RouteSmith",
                "branch": "main",
                "status": "paused",
                "feature_flag_key": "pricing_annual_default",
                "total_participants": 4970,
                "created_at": "2026-04-20T08:00:00Z",
                "updated_at": "2026-05-08T18:00:00Z",
                "duration_days": 21,
                "variants": [
                    {
                        "id": "control",
                        "name": "Variant A (Monthly Default)",
                        "type": "control",
                        "weight": 50,
                        "description": "Standard monthly pricing selected by default",
                        "exposures": 2485,
                        "conversions": 186,
                        "conversion_rate": 7.5,
                    },
                    {
                        "id": "treatment",
                        "name": "Variant B (Annual Default + Badge)",
                        "type": "treatment",
                        "weight": 50,
                        "description": "Annual pricing preselected with subtle green 20% off pill",
                        "exposures": 2485,
                        "conversions": 218,
                        "conversion_rate": 8.8,
                    },
                ],
                "metrics": {
                    "primary_metric": "annual_plan_purchased",
                    "secondary_metrics": ["total_order_value"],
                    "minimum_detectable_effect": 2.0,
                    "statistical_power": 0.8,
                    "confidence_level": 0.95,
                    "p_value": 0.082,
                    "relative_lift": 17.3,
                    "is_significant": False,
                },
                "ai_recommendation": "Inconclusive result (p = 0.082 > 0.05). Lift of +17.3% observed but insufficient sample size to guarantee confidence. Paused by administrator.",
            }
        ]

        # Live ingested telemetry events
        self.events: List[Dict[str, Any]] = []

    def get_all_experiments(self) -> List[Dict[str, Any]]:
        return self.experiments

    def get_experiment_by_id(self, exp_id: str) -> Optional[Dict[str, Any]]:
        for e in self.experiments:
            if e["id"] == exp_id:
                return e
        return None

    def add_event(self, exp_id: str, variant_id: str, event_type: str, participant_id: str) -> Dict[str, Any]:
        event = {
            "id": f"evt_{int(time.time() * 1000)}",
            "experiment_id": exp_id,
            "variant_id": variant_id,
            "event_type": event_type,
            "participant_id": participant_id,
            "timestamp": time.time()
        }
        self.events.append(event)

        # Update experiment in-memory counts
        exp = self.get_experiment_by_id(exp_id)
        if exp:
            for v in exp["variants"]:
                if v["id"] == variant_id:
                    if event_type == "exposure":
                        v["exposures"] += 1
                    elif event_type == "conversion":
                        v["conversions"] += 1
                    
                    if v["exposures"] > 0:
                        v["conversion_rate"] = round((v["conversions"] / v["exposures"]) * 100, 1)

            # Update total participants
            exp["total_participants"] += 1 if event_type == "exposure" else 0

        return event

store = DataStore()
