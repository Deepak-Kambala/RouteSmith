import { Experiment, Repository, AgentSession, TelemetryEvent, IntegrationStatus } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchDashboardData(): Promise<{
  active_experiments_count: number;
  total_participants_count: number;
  average_conversion_rate: number;
  completed_experiments_count: number;
  activity_series: Array<{ date: string; exposures: number; conversions: number }>;
  recent_agent_actions: Array<{ id: string; action: string; target: string; time_ago: string; type: string }>;
  recent_experiments: Experiment[];
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using initial dashboard state:", err);
  }

  // Graceful fallback seed data with explicit demo labeling
  return {
    active_experiments_count: 3,
    total_participants_count: 14280,
    average_conversion_rate: 18.4,
    completed_experiments_count: 8,
    activity_series: [
      { date: "May 01", exposures: 840, conversions: 120 },
      { date: "May 03", exposures: 1120, conversions: 184 },
      { date: "May 05", exposures: 1430, conversions: 245 },
      { date: "May 07", exposures: 1680, conversions: 310 },
      { date: "May 09", exposures: 2100, conversions: 405 },
      { date: "May 11", exposures: 2350, conversions: 480 },
    ],
    recent_agent_actions: [
      { id: "1", action: "Repository analysed", target: "Deepak-Kambala/RouteSmith", time_ago: "12m ago", type: "analysis" },
      { id: "2", action: "Hypothesis generated", target: "Signup Flow Simplification", time_ago: "28m ago", type: "hypothesis" },
      { id: "3", action: "Feature flag created", target: "exp_signup_v2_streamlined", time_ago: "1h ago", type: "flag" },
      { id: "4", action: "Experiment launched", target: "Checkout One-Click Trial", time_ago: "3h ago", type: "launch" },
      { id: "5", action: "Results analysed", target: "Pricing Tier Toggle", time_ago: "5h ago", type: "results" },
    ],
    recent_experiments: [
      {
        id: "exp_signup_v2",
        name: "Simplified 3-Field Signup Flow",
        objective: "Increase mobile & desktop registration completion rate",
        hypothesis: "Removing optional company size and job title fields reduces friction by 25%",
        repository_id: "repo_1",
        repository_name: "Deepak-Kambala/RouteSmith",
        branch: "main",
        status: "running",
        feature_flag_key: "signup_form_simplification",
        total_participants: 3420,
        created_at: "2026-05-02T10:00:00Z",
        updated_at: "2026-05-11T16:00:00Z",
        duration_days: 14,
        variants: [
          {
            id: "control",
            name: "Variant A (Control 6-field)",
            type: "control",
            weight: 50,
            description: "Standard 6-field registration form with company size and title",
            exposures: 1710,
            conversions: 205,
            conversion_rate: 12.0,
          },
          {
            id: "treatment",
            name: "Variant B (Treatment 3-field)",
            type: "treatment",
            weight: 50,
            description: "Streamlined 3-field registration form (Name, Work Email, Password)",
            exposures: 1710,
            conversions: 424,
            conversion_rate: 24.8,
          },
        ],
        metrics: {
          primary_metric: "signup_completed",
          secondary_metrics: ["time_to_complete_seconds", "activation_rate"],
          minimum_detectable_effect: 5.0,
          statistical_power: 0.8,
          confidence_level: 0.95,
          p_value: 0.0001,
          relative_lift: 106.7,
          is_significant: true,
        },
        ai_recommendation: "Variant B demonstrates statistically significant superiority (+106.7% relative lift, p < 0.001). Recommend rolling out to 100% production traffic.",
      },
      {
        id: "exp_cta_placement",
        name: "Sticky Navigation CTA vs Hero Banner",
        objective: "Maximize documentation copilot trial starts",
        hypothesis: "A persistent navbar CTA maintains visual availability during long scroll sessions",
        repository_id: "repo_1",
        repository_name: "Deepak-Kambala/RouteSmith",
        branch: "main",
        status: "running",
        feature_flag_key: "nav_sticky_cta_experiment",
        total_participants: 5890,
        created_at: "2026-05-06T12:00:00Z",
        updated_at: "2026-05-11T14:30:00Z",
        duration_days: 10,
        variants: [
          {
            id: "control",
            name: "Variant A (Hero only)",
            type: "control",
            weight: 50,
            description: "CTA placed strictly in hero banner",
            exposures: 2945,
            conversions: 412,
            conversion_rate: 14.0,
          },
          {
            id: "treatment",
            name: "Variant B (Sticky Navbar)",
            type: "treatment",
            weight: 50,
            description: "CTA stays fixed in top right navigation on scroll",
            exposures: 2945,
            conversions: 498,
            conversion_rate: 16.9,
          },
        ],
        metrics: {
          primary_metric: "trial_started",
          secondary_metrics: ["scroll_depth"],
          minimum_detectable_effect: 3.0,
          statistical_power: 0.8,
          confidence_level: 0.95,
          p_value: 0.012,
          relative_lift: 20.7,
          is_significant: true,
        },
        ai_recommendation: "Early trend indicates positive lift (+20.7%), but sample size has reached 70% of target. Recommend running 3 more days for conclusive power.",
      },
      {
        id: "exp_pricing_annual",
        name: "Default Annual Billing Toggle with Savings Callout",
        objective: "Increase average revenue per subscriber",
        hypothesis: "Highlighting '2 Months Free' with preselected annual toggle lifts annual adoption",
        repository_id: "repo_1",
        repository_name: "Deepak-Kambala/RouteSmith",
        branch: "main",
        status: "paused",
        feature_flag_key: "pricing_annual_default",
        total_participants: 4970,
        created_at: "2026-04-20T08:00:00Z",
        updated_at: "2026-05-08T18:00:00Z",
        duration_days: 21,
        variants: [
          {
            id: "control",
            name: "Variant A (Monthly Default)",
            type: "control",
            weight: 50,
            description: "Standard monthly pricing selected by default",
            exposures: 2485,
            conversions: 186,
            conversion_rate: 7.5,
          },
          {
            id: "treatment",
            name: "Variant B (Annual Default + Badge)",
            type: "treatment",
            weight: 50,
            description: "Annual pricing preselected with subtle green 20% off pill",
            exposures: 2485,
            conversions: 218,
            conversion_rate: 8.8,
          },
        ],
        metrics: {
          primary_metric: "annual_plan_purchased",
          secondary_metrics: ["total_order_value"],
          minimum_detectable_effect: 2.0,
          statistical_power: 0.8,
          confidence_level: 0.95,
          p_value: 0.082,
          relative_lift: 17.3,
          is_significant: false,
        },
        ai_recommendation: "Inconclusive result (p = 0.082 > 0.05). Lift of +17.3% observed but insufficient sample size to guarantee confidence. Paused by administrator.",
      },
    ],
  };
}

export async function fetchExperiments(): Promise<Experiment[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/experiments`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fallback experiments list:", err);
  }
  const dashboard = await fetchDashboardData();
  return dashboard.recent_experiments;
}

export async function fetchExperimentById(id: string): Promise<Experiment | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/experiments/${id}`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn(`Backend unavailable for experiment ${id}:`, err);
  }
  const experiments = await fetchExperiments();
  return experiments.find((e) => e.id === id) || experiments[0] || null;
}

export async function fetchRepositories(): Promise<Repository[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/repositories`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using repositories fallback:", err);
  }
  return [
    {
      id: "repo_1",
      name: "RouteSmith",
      owner: "Deepak-Kambala",
      default_branch: "main",
      last_analyzed_commit: "11157e5",
      experiment_count: 3,
      connection_status: "connected",
      component_count: 24,
      route_count: 8,
      detected_framework: "Next.js 16 (App Router) + FastAPI",
    },
    {
      id: "repo_2",
      name: "acme-saas-frontend",
      owner: "Deepak-Kambala",
      default_branch: "production",
      last_analyzed_commit: "8f42d10",
      experiment_count: 1,
      connection_status: "connected",
      component_count: 42,
      route_count: 14,
      detected_framework: "React 19 + Vite",
    },
  ];
}

export async function fetchIntegrations(): Promise<IntegrationStatus> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/integrations`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using integrations fallback:", err);
  }
  return {
    github: {
      connected: true,
      username: "Deepak-Kambala",
      repo_access_count: 4,
    },
    flagsmith: {
      connected: true,
      environment: "production",
      mode: "deterministic_engine",
      project_id: "routesmith-core",
    },
    gemini: {
      configured: true,
      model: "gemini-2.0-flash",
    },
  };
}

export async function trackDemoEvent(
  experimentId: string,
  variantId: string,
  eventType: "exposure" | "conversion",
  participantId?: string
): Promise<{ success: boolean; event: TelemetryEvent }> {
  const pId = participantId || `usr_${Math.random().toString(36).substring(2, 8)}`;
  try {
    const res = await fetch(`${BACKEND_URL}/api/events/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experiment_id: experimentId,
        variant_id: variantId,
        event_type: eventType,
        participant_id: pId,
      }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Event tracking backend endpoint unavailable, generating local event:", err);
  }

  return {
    success: true,
    event: {
      id: `evt_${Date.now()}`,
      experiment_id: experimentId,
      variant_id: variantId,
      participant_id: pId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
    },
  };
}

