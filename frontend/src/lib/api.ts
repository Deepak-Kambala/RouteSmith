/**
 * SearchForge - API Client
 * Connects to the SearchForge FastAPI backend.
 * Provides explicit, un-fabricated empty states when backend data is absent or unreachable.
 */

import {
  FlagsmithConfig,
  UserExperimentState,
  OfflineBenchmarkState,
  SearchResponse,
} from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Empty fallback state for Flagsmith configuration when backend is unreachable.
 * Never invents mock API connections or fake projects.
 */
export const EMPTY_FLAGSMITH_CONFIG: FlagsmithConfig = {
  is_live: false,
  mode: "unconnected",
  environment_key_masked: "NONE",
  api_url: "https://edge.api.flagsmith.com/api/v1/",
  connection_message: "Backend unavailable: Unable to reach SearchForge API.",
  active_flags: {
    flag_key: "retrieval_ranking_engine",
    default_variant: "hybrid_rrf",
    alpha: 0.45,
    rrf_k: 60,
    code_boost: 1.35,
    latency_sla_ms: 25.0,
    kill_switch_active: false,
  },
};

/**
 * Honest empty state for User Experiment when no sessions have been recorded.
 * Shows N=0 and zero fabricated participants/conversions.
 */
export const EMPTY_EXPERIMENT_STATE: UserExperimentState = {
  evidence_type: "user_experiment",
  hypothesis:
    "Serving Hybrid RRF ranking increases the proportion of search sessions where developers find and copy code snippets compared to baseline BM25.",
  primary_metric: "Snippet Copy Rate (Proxy for Usefulness)",
  observation_rule:
    "Exposure is recorded once per stable session ID upon first search. A conversion is recorded at most once per session when a snippet is copied.",
  status: "NO_DATA",
  status_message: "No experiment data yet. Execute searches or test a labeled scenario.",
  total_sessions: 0,
  total_conversions: 0,
  winner_variant: null,
  winner_lift: null,
  winner_probability: null,
  variants: [
    {
      variant_id: "lexical_bm25",
      name: "lexical_bm25 (Control)",
      tag: "Control",
      description: "BM25Okapi exact keyword and symbol matching",
      color: "#D99B26",
      exposures: 0,
      conversions: 0,
      conversion_rate: 0.0,
      ci_lower: 2.5,
      ci_upper: 97.5,
      win_probability: 33.3,
      relative_lift: "Baseline (Control)",
      relative_lift_value: 0.0,
      alpha: 1.0,
      beta: 1.0,
    },
    {
      variant_id: "semantic_dense",
      name: "semantic_dense",
      tag: "Variant B",
      description: "32-component TruncatedSVD latent semantic cosine similarity",
      color: "#38BDF8",
      exposures: 0,
      conversions: 0,
      conversion_rate: 0.0,
      ci_lower: 2.5,
      ci_upper: 97.5,
      win_probability: 33.3,
      relative_lift: "No baseline data",
      relative_lift_value: 0.0,
      alpha: 1.0,
      beta: 1.0,
    },
    {
      variant_id: "hybrid_rrf",
      name: "hybrid_rrf",
      tag: "Variant C",
      description: "Reciprocal Rank Fusion balancing lexical precision and semantic recall",
      color: "#37ECA5",
      exposures: 0,
      conversions: 0,
      conversion_rate: 0.0,
      ci_lower: 2.5,
      ci_upper: 97.5,
      win_probability: 33.4,
      relative_lift: "No baseline data",
      relative_lift_value: 0.0,
      alpha: 1.0,
      beta: 1.0,
    },
  ],
  curves: {},
  telemetry_recent: [],
};

export async function fetchFlagsmithConfig(): Promise<FlagsmithConfig> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/config`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable for config, using empty state:", err);
  }
  return EMPTY_FLAGSMITH_CONFIG;
}

export async function fetchUserExperimentState(): Promise<UserExperimentState> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/experiment/state`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable for experiment state, using empty state:", err);
  }
  return EMPTY_EXPERIMENT_STATE;
}

export async function fetchOfflineBenchmark(): Promise<OfflineBenchmarkState | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/benchmark/results`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable for benchmark results:", err);
  }
  return null;
}

export async function executeSearch(params: {
  query: string;
  sessionId: string;
  traits?: Record<string, any>;
  simulateLatency?: boolean;
}): Promise<SearchResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: params.query,
        session_id: params.sessionId,
        user_id: params.sessionId,
        traits: params.traits,
        simulate_latency: params.simulateLatency,
      }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Search execution failed:", err);
  }
  return null;
}

export async function recordSnippetConversion(params: {
  sessionId: string;
  docId: string;
  rank: number;
}): Promise<{
  success: boolean;
  duplicate: boolean;
  message: string;
  attributed_variant?: string;
  state: UserExperimentState;
} | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/conversion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: params.sessionId,
        doc_id: params.docId,
        rank: params.rank,
      }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Conversion tracking failed:", err);
  }
  return null;
}

export async function injectLabeledScenario(
  scenarioName: "inconclusive_low_sample" | "sdk_exact_bm25_wins" | "mixed_traffic_hybrid_wins" | "reset"
): Promise<UserExperimentState | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/experiment/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: scenarioName }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.state;
    }
  } catch (err) {
    console.error("Scenario injection failed:", err);
  }
  return null;
}

export async function updateFlagsmithKey(newKey: string): Promise<FlagsmithConfig | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/config/key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ environment_key: newKey.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.status;
    }
  } catch (err) {
    console.error("Failed to update Flagsmith key:", err);
  }
  return null;
}
