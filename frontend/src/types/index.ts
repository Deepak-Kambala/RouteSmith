/**
 * SearchForge - Core TypeScript Definitions
 * Track 01: Flagsmith Experimentation & Hybrid Search Workbench
 */

export type SearchVariant = "lexical_bm25" | "semantic_dense" | "hybrid_rrf";

export type AssignmentSource = "live_flagsmith_edge" | "local_simulation";

export type ExperimentStatus =
  | "COLLECTING_EVIDENCE"
  | "INCONCLUSIVE"
  | "STATISTICAL_WINNER_DETECTED"
  | "NO_DATA";

export interface RemoteConfigValues {
  alpha: number;
  rrf_k: number;
  code_boost: number;
  latency_sla_ms: number;
}

export interface FlagsmithConfig {
  is_live: boolean;
  mode: "live_edge_sdk" | "local_simulation" | "unconnected";
  environment_key_masked: string;
  api_url: string;
  connection_message: string;
  active_flags: {
    flag_key: string;
    default_variant: string;
    alpha: number;
    rrf_k: number;
    code_boost: number;
    latency_sla_ms: number;
    kill_switch_active: boolean;
  };
}

export interface FlagsmithEvaluation {
  identifier: string;
  traits: Record<string, any>;
  variant: SearchVariant;
  assignment_source: AssignmentSource;
  evaluated_flag: string;
  is_live_flagsmith: boolean;
  flagsmith_edge_connected: boolean;
  kill_switch_active: boolean;
  segment_override: boolean;
  segment_name: string | null;
  remote_config: RemoteConfigValues;
  warning: string | null;
  experiment_type: string;
}

export interface SearchDocument {
  id: string;
  title: string;
  category: string;
  snippet: string;
  text: string;
  tags: string[];
  bm25_rank: number;
  dense_rank: number;
  final_rank: number;
  score: number;
  lexical_pct: number;
  dense_pct: number;
}

export interface SearchResponse {
  flagsmith: FlagsmithEvaluation;
  search: {
    query: string;
    variant: SearchVariant;
    has_code_tokens: boolean;
    latency_ms: number;
    results: SearchDocument[];
  };
  exposure: {
    session_id: string;
    assigned_variant: SearchVariant;
    is_new_exposure: boolean;
  };
  latency_ms: number;
}

export interface VariantExperimentStats {
  variant_id: SearchVariant;
  name: string;
  tag: string;
  description: string;
  color: string;
  exposures: number;
  conversions: number;
  conversion_rate: number;
  ci_lower: number;
  ci_upper: number;
  win_probability: number;
  relative_lift: string;
  relative_lift_value: number;
  alpha: number;
  beta: number;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  session_id: string;
  variant: SearchVariant;
  assignment_source: AssignmentSource;
  event: string;
  details: string;
  status: "EXPOSURE" | "CONVERSION";
}

export interface UserExperimentState {
  evidence_type: "user_experiment";
  hypothesis: string;
  primary_metric: string;
  observation_rule: string;
  status: ExperimentStatus;
  status_message: string;
  total_sessions: number;
  total_conversions: number;
  winner_variant: SearchVariant | null;
  winner_lift: string | null;
  winner_probability: number | null;
  variants: VariantExperimentStats[];
  curves: Record<string, CurvePoint[]>;
  telemetry_recent: TelemetryEvent[];
}

export interface CategoryBreakdown {
  total: number;
  hits_at_3: number;
  recall_at_3: number;
}

export interface OfflineBenchmarkVariantResult {
  variant_id: SearchVariant;
  name: string;
  color: string;
  queries_evaluated: number;
  recall_at_3: number;
  precision_at_1: number;
  mrr_at_3: number;
  avg_latency_ms: number;
  category_breakdown: Record<string, CategoryBreakdown>;
}

export interface OfflineBenchmarkState {
  evidence_type: "offline_retrieval_benchmark";
  dataset_description: string;
  relevance_assumptions: string;
  total_queries: number;
  results: Record<string, OfflineBenchmarkVariantResult>;
}
