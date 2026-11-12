export type ExperimentStatus = "draft" | "running" | "paused" | "concluded";

export interface Variant {
  id: string;
  name: string;
  type: "control" | "treatment";
  weight: number; // e.g. 50
  description: string;
  code_snippet?: string;
  file_path?: string;
  exposures: number;
  conversions: number;
  conversion_rate: number;
}

export interface ExperimentMetric {
  primary_metric: string;
  secondary_metrics: string[];
  minimum_detectable_effect: number;
  statistical_power: number;
  confidence_level: number;
  p_value?: number;
  relative_lift?: number;
  is_significant?: boolean;
}

export interface Experiment {
  id: string;
  name: string;
  objective: string;
  hypothesis: string;
  repository_id: string;
  repository_name: string;
  branch: string;
  status: ExperimentStatus;
  feature_flag_key: string;
  variants: Variant[];
  metrics: ExperimentMetric;
  total_participants: number;
  created_at: string;
  updated_at: string;
  duration_days: number;
  target_audience?: string;
  potential_risks?: string[];
  ai_recommendation?: string;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  default_branch: string;
  last_analyzed_commit: string;
  experiment_count: number;
  connection_status: "connected" | "syncing" | "error";
  component_count: number;
  route_count: number;
  detected_framework: string;
}

export type ToolStatus = "waiting" | "running" | "completed" | "failed" | "requires_approval";

export interface ToolRun {
  id: string;
  tool_name: string;
  status: ToolStatus;
  input_params: Record<string, any>;
  output_summary?: string;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface AgentMessage {
  id: string;
  sender: "user" | "agent" | "system";
  content: string;
  timestamp: string;
  reasoning_summary?: string;
  tool_runs?: ToolRun[];
  proposed_patch?: {
    file_path: string;
    original_code: string;
    modified_code: string;
    diff: string;
  };
  proposed_experiment?: Partial<Experiment>;
  requires_approval?: boolean;
  approval_status?: "pending" | "approved" | "rejected";
}

export interface AgentSession {
  id: string;
  title: string;
  created_at: string;
  repository_id: string;
  messages: AgentMessage[];
}

export interface TelemetryEvent {
  id: string;
  experiment_id: string;
  participant_id: string;
  variant_id: string;
  event_type: "exposure" | "conversion";
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IntegrationStatus {
  github: {
    connected: boolean;
    username?: string;
    repo_access_count?: number;
  };
  flagsmith: {
    connected: boolean;
    environment?: string;
    mode: "cloud_sdk" | "deterministic_engine";
    project_id?: string;
  };
  gemini: {
    configured: boolean;
    model: string;
  };
}
