# RouteSmith — AI-Powered Experimentation Engineer

> **"Turn any product improvement goal into a live, measurable experiment."**

RouteSmith (ExperimentOS) is a production-quality experimentation platform that acts as an AI experimentation engineer for developers and product teams. It inspects connected GitHub repositories, maps component and routing AST trees, generates hypotheses and code patches, creates Flagsmith feature flags, instruments exposure and conversion events, and computes Bayesian and Frequentist statistics with automated recommendations.

---

## 1. Product Vision & Architecture

When a product engineer inputs a goal such as:
> *"Increase signup conversion on my website by simplifying the registration flow."*

RouteSmith's AI agent:
1. **Understands the objective** and maps business intent to user touchpoints.
2. **Inspects the connected GitHub repository** via AST component parsing.
3. **Discovers experiment surfaces** (e.g. form inputs, CTAs, modal triggers).
4. **Formulates hypotheses** with control vs treatment definitions.
5. **Prepares code changes** and Flagsmith multivariate evaluation logic.
6. **Requires explicit human authorization** before code changes or flags are deployed.
7. **Synchronizes with Flagsmith** to create feature flags with 50/50 traffic splits.
8. **Tracks exposure and conversion telemetry** with pseudonymous participant attribution.
9. **Calculates Bayesian Beta posteriors and Two-Sample Z-Tests** ($p$-value, relative lift, 95% confidence intervals).
10. **Delivers executive recommendations** on whether to promote the winner to 100% production traffic.

---

## 2. Design System

Designed with a premium light-first developer tool aesthetic comparable to Linear, Vercel, Stripe, and Raycast:

- **Primary Background**: `#F8FAFC`
- **Sidebar & Cards**: `#FFFFFF` with subtle 1px `#E5E7EB` borders and soft elevation (`shadow-xs`)
- **Primary Text**: `#111827` &bull; **Secondary Text**: `#64748B` &bull; **Muted**: `#94A3B8`
- **Brand Blue**: `#3867F5` (Hover: `#2853D9`, Surface: `#EFF4FF`)
- **Semantic Accents**: Success `#16A36A`, Warning `#D99725`, Danger `#DC5555`
- **Typography**: Inter (UI prose/headings), Geist Mono / JetBrains Mono (code, metrics, paths)
- **Zero AI Slop**: No purple/neon gradients, no oversized marketing titles, no emojis in interface icons.

---

## 3. Core Screens & Navigation

1. **Overview Dashboard (`/dashboard`)**:
   - 4 Top KPI cards (Active Experiments, Total Participants, Average Conversion Rate, Completed Experiments).
   - Clean Recharts line chart tracking exposures and conversions over time.
   - Real-time AI agent activity feed and recent experiments registry.
2. **Experiment Creation Wizard (`/experiments/new`)**:
   - Guided 5-step flow: Objective &rarr; Repository & Branch &rarr; Real AST Analysis &rarr; Proposal &rarr; Human Approval.
3. **AI Agent Workspace (`/agent`)**:
   - Interactive 3-column workbench with session history, structured tool execution cards (`analyze_repository`, `identify_experiment_points`, `generate_hypothesis`, `generate_code_patch`, `create_feature_flag`), code diff viewer, and approval gates.
4. **Experiment Details (`/experiments/[id]`)**:
   - Management header with start/pause/stop traffic controls.
   - 6 tabs: Overview, Variants, Participants, Metrics &amp; Stats ($p$-value, confidence intervals), Implementation (SDK snippets), and AI Insights.
5. **Analytics (`/analytics`)**:
   - Conversion trends over time, variant performance benchmarking, and statistical power metrics.
6. **Repositories (`/repositories`)**:
   - Connected repositories, framework detection, and commit-based AST incremental caching.
7. **Integrations (`/integrations`)**:
   - Connection management for Flagsmith, GitHub API, and Google Gemini 2.0 runtime.
8. **Live Working Demonstration (`/demo/signup`)**:
   - Complete interactive signup flow comparing **Variant A (6 fields)** vs **Variant B (3 fields)** with real live exposure tracking, conversion attribution, and instant statistical impact!

---

## 4. Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons, Recharts.
- **Backend**: Python, FastAPI, Pydantic, Uvicorn.
- **Database**: Supabase PostgreSQL schema (`schema.sql`) with seamless local SQLite fallback store.
- **Experimentation Engine**: Official Flagsmith API and deterministic Murmur3 100-bucket identity hashing.
- **Code Intelligence**: Python AST parser and TypeScript component scanner with commit caching.
- **AI Runtime**: Google Gemini 2.0 with structured tool execution.

---

## 5. Local Setup & Execution

### Prerequisites
- Node.js 18+ and Python 3.10+

### 1. Environment Configuration
Create `.env` in the repository root:
\`\`\`bash
GEMINI_API_KEY=your_gemini_api_key_here
FLAGSMITH_ENVIRONMENT_KEY=
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
PORT=8000
\`\`\`

### 2. Start the Backend API
\`\`\`bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
\`\`\`

### 3. Start the Next.js Frontend
\`\`\`bash
cd frontend
npm install
npm run build
npm start
\`\`\`
Visit **`http://localhost:3000`** to access the RouteSmith workspace.
