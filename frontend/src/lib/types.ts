export type VariantType = "fast_zero_shot" | "clustered_hybrid_rag" | "agentic_self_reflection";

export interface FlagsmithEval {
  identifier: string;
  traits: Record<string, any>;
  strategy: VariantType;
  enable_semantic_cache: boolean;
  max_context_tokens: number;
  source: string;
  traffic_weights?: Record<string, number>;
}

export interface ChatResponse {
  user_id: string;
  active_variant: VariantType;
  pipeline_title: string;
  answer: string;
  code: string;
  language: string;
  latency_ms: number;
  cost_usd: number;
  flagsmith_eval: FlagsmithEval;
  warning?: string;
}

export interface TelemetryEvent {
  id: string;
  event: "EXPOSURE" | "EVENT_TRACKED";
  identifier: string;
  variant?: string;
  metric?: string;
  latency_ms?: number;
  value?: number;
  timestamp: number;
}

export interface VariantStats {
  exposures: number;
  conversions: number;
  observed_conversion_rate: number;
  posterior_alpha: number;
  posterior_beta: number;
  posterior_mean_pct: number;
  ci_95: [number, number];
  latency_ms: number;
  win_probability_pct?: number;
}

export interface BayesianReport {
  variants: Record<string, VariantStats>;
  recommended_winner: string;
  winner_win_probability_pct: number;
  relative_lift_pct: number;
  curve_points: Array<{
    rate_pct: number;
    fast_zero_shot: number;
    clustered_hybrid_rag: number;
    agentic_self_reflection: number;
  }>;
}
