# RouteSmith: AI-Powered Experimentation Engineer
## Architecture & Implementation Master Plan

> "Turn any product improvement goal into a live, measurable experiment."

---

### Executive Vision & Design System
RouteSmith is an AI agent that acts as an experimentation engineer for developers and product teams. It inspects connected GitHub repositories, maps component and routing AST trees, generates hypotheses and code patches, creates Flagsmith feature flags, instruments exposure and conversion events, and computes Bayesian and Frequentist statistics with automated recommendations.

#### Design System (Strict Specification)
- **Aesthetic**: Premium light-first developer tool (comparable to Linear, Vercel, Stripe, Raycast).
- **Palette**:
  - Primary Background: `#F8FAFC`
  - Sidebar Background: `#FFFFFF`
  - Card Background: `#FFFFFF`
  - Primary Text: `#111827`
  - Secondary Text: `#64748B`
  - Muted Text: `#94A3B8`
  - Subtle Borders: `#E5E7EB` (1px)
  - Primary Brand Blue: `#3867F5` (Hover: `#2853D9`)
  - Semantic Colors: Success `#16A36A`, Warning `#D99725`, Danger `#DC5555`, Surface Blue `#EFF4FF`
- **Typography**: Inter (UI prose/headings), Geist Mono / JetBrains Mono (code, paths, metrics, flags).
- **Layout**: Fixed 248px left sidebar, 64px top navigation, 1440px max content width with 32px desktop padding, 10-12px card radius, 8px button/input radius.
- **Strict Constraints**: No purple/neon gradients, no oversized marketing titles, no emojis in interface icons, strict human approval gates before code patches or experiment launches.

---

### Phased Roadmap

#### Phase 1: Design System & Application Shell
- Clean Next.js 16 (App Router) + Tailwind CSS + Lucide setup.
- Persistent left sidebar with Navigation (`/dashboard`, `/experiments`, `/agent`, `/repositories`, `/analytics`), Workspace links (`/flags`, `/events`, `/integrations`), and Footer links (`/docs`, `/settings`).
- Top Navigation with dynamic breadcrumbs, keyboard shortcuts (`⌘K`), notifications, and user avatar.
- Responsive mobile drawer and collapsible sidebar states.

#### Phase 2: Core Views & Navigation
- `/dashboard`: Overview with 4 KPI cards, experiment activity chart (Recharts), AI agent activity feed, and recent experiments table.
- `/experiments/new`: Guided 5-step experiment creation wizard (Objective -> Repository -> Real AI Analysis -> Proposal -> Review & Approval).
- `/experiments`: Complete experiment list with status filtering, search, and quick launch.
- `/experiments/[id]`: Detailed experiment view with 6 tabs: Overview, Variants, Participants, Metrics, Implementation, AI Insights.
- `/repositories`: Connected GitHub repositories with commit-based incremental caching and AST scan triggers.
- `/settings/integrations`: Secure connection management for GitHub, Flagsmith, and AI Providers (Gemini / Claude / OpenAI).

#### Phase 3: Modular Backend & Repository Intelligence
- FastAPI modular architecture (`app/api/`, `app/agent/`, `app/analyzer/`, `app/flagsmith/`, `app/events/`, `app/stats/`).
- Python AST parsing and TypeScript/JavaScript parser to extract components, props, routes, and forms.
- Commit hash caching for incremental repo indexing.
- Supabase PostgreSQL schema (`schema.sql`) with seamless local SQLite persistence fallback.

#### Phase 4: AI Agent Workspace & Flagsmith Integration
- `/agent`: Interactive AI Agent workbench with 3-column split view (Session history, interactive conversation + tool execution cards, repository context & component tree).
- Real tool definitions:
  - `analyze_repository`
  - `identify_experiment_points`
  - `generate_hypothesis`
  - `generate_experiment_variants`
  - `generate_code_patch`
  - `create_feature_flag`
  - `validate_instrumentation`
  - `analyze_results`
- Official Flagsmith API integration with automatic feature flag creation and multivariate split management (plus deterministic local SDK fallback engine).
- Live interactive sample signup flow (`/demo/signup`): Variant A (6 fields) vs Variant B (3 fields).

#### Phase 5: Event Collection & Statistical Engine
- Ingestion endpoint (`POST /api/events/track`) with session deduplication, participant registry, and exposure/conversion attribution.
- Closed-form Beta posterior calculations (Bayesian probability of winning) + Two-sample Z-test / Fisher exact test (Frequentist p-value, 95% confidence intervals, sample size power check).
- `/analytics`: Recharts conversion trends, variant comparisons, participant distributions, and statistical power curves.

#### Phase 6: Polish, Verification & Test Suite
- Comprehensive end-to-end testing of the full signup experiment cycle.
- Mobile responsiveness and empty/error states.
- Clean documentation in `README.md`.
