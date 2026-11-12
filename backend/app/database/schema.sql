-- RouteSmith / ExperimentOS Supabase PostgreSQL Schema
-- Production Data Model with Row Level Security (RLS)

-- 1. Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'engineer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Repositories
CREATE TABLE IF NOT EXISTS repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    last_analyzed_commit VARCHAR(40),
    detected_framework VARCHAR(100),
    connection_status VARCHAR(50) DEFAULT 'connected',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Repository Analyses (Commit-based Caching)
CREATE TABLE IF NOT EXISTS repository_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
    commit_hash VARCHAR(40) NOT NULL,
    components_json JSONB NOT NULL DEFAULT '[]',
    routes_json JSONB NOT NULL DEFAULT '[]',
    experiment_surfaces_json JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Feature Flags (Flagsmith synchronization)
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    flag_key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    split_strategy VARCHAR(50) DEFAULT 'multivariate_50_50',
    flagsmith_feature_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Experiments
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    repository_id UUID REFERENCES repositories(id) ON DELETE SET NULL,
    feature_flag_id UUID REFERENCES feature_flags(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'running', -- 'draft', 'running', 'paused', 'concluded'
    duration_days INT DEFAULT 14,
    target_audience TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Experiment Variants
CREATE TABLE IF NOT EXISTS experiment_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'control', 'treatment'
    weight INT DEFAULT 50,
    description TEXT,
    code_snippet TEXT,
    exposures INT DEFAULT 0,
    conversions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Participants
CREATE TABLE IF NOT EXISTS experiment_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    pseudonymous_id VARCHAR(100) NOT NULL,
    assigned_variant_id UUID REFERENCES experiment_variants(id),
    first_exposed_at TIMESTAMPTZ DEFAULT NOW(),
    has_converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    UNIQUE(experiment_id, pseudonymous_id)
);

-- 9. Experiment Events
CREATE TABLE IF NOT EXISTS experiment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    participant_id VARCHAR(100) NOT NULL,
    variant_id UUID REFERENCES experiment_variants(id),
    event_type VARCHAR(50) NOT NULL, -- 'exposure', 'conversion'
    metric_name VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Experiment Metrics (Statistical telemetry)
CREATE TABLE IF NOT EXISTS experiment_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    primary_metric VARCHAR(100) NOT NULL,
    relative_lift FLOAT,
    p_value FLOAT,
    ci_lower FLOAT,
    ci_upper FLOAT,
    statistical_power FLOAT,
    is_significant BOOLEAN DEFAULT FALSE,
    ai_recommendation TEXT,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Agent Sessions
CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Agent Tool Runs
CREATE TABLE IF NOT EXISTS agent_tool_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'waiting', 'running', 'completed', 'failed', 'requires_approval'
    input_params JSONB NOT NULL,
    output_summary TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_exp ON experiment_participants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_events_exp ON experiment_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON experiment_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_commit ON repository_analyses(repository_id, commit_hash);

