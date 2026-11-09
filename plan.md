# 📋 RouteSmith AI — UI & Development Master Plan

> **Design Philosophy & Visual Mandate:**  
> **Strictly NO generic AI slop, NO neon purple/navy cyber-themes, and NO cookie-cutter SaaS layouts.**  
> Inspired by the craft, editorial warmth, and tactile minimalism of **LocalFlow** (clean cream canvas, editorial serif display typography, highlighter brush accents, crisp tactile pill controls, and organic human-crafted annotations).

---

## 🎨 1. Design System & Aesthetic Architecture

### 1.1 Color Palette & Canvas (Warm Editorial Craft)
* **Canvas Backgrounds:**
  * Base Background: `#FAF8F5` (Warm Cream / Alabaster Linen)
  * Secondary Surface: `#F3EFEA` (Subtle tactile panel fill)
  * Card Background: `#FFFFFF` (Pure white with warm crisp border `#E7E2D9`)
  * Elevated Hover: `#FCFAF7`
* **Typography & Ink:**
  * Primary Ink: `#181715` (Deep warm charcoal ink, never harsh `#000`)
  * Secondary Ink: `#6B665E` (Warm slate gray for labels, metadata, captions)
  * Muted / Border Ink: `#D5CEC4` (Hairline dividers, tactile containers)
* **Handcrafted Accent Highlights (Reference UI Style):**
  * **Marker Highlighter Yellow:** `#FEF08A` / `#FDE047` (Organic brush stroke behind key hero words like *"There it is."* / *"Winner Found."*)
  * **Terracotta / Burnt Vermilion:** `#E04F34` (Delicate handwritten annotations, e.g. `"live traffic split 33/33/34"`)
  * **Electric Cobalt Accent:** `#2563EB` (Primary action pills, active status pills)
  * **Sage Mint Green:** `#10B981` (Conversions, resolved indicators, win probability badges)
  * **Warm Amber:** `#F59E0B` (Variant C CoT latency warnings)

### 1.2 Typography Hierarchy
* **Display / Hero Serif:** `Instrument Serif`, `Fraunces`, or `Newsreader` (Editorial, commanding, humanistic italic accents).
  * Example: *"When docs answer. Code runs."* with italic serif underline.
* **Interface Body & Headings:** `Geist Sans`, `Plus Jakarta Sans`, or `Inter` (500/600 weight, crisp tracking).
* **Code & Telemetry Mono:** `JetBrains Mono` or `Geist Mono` (12px/13px for raw Flagsmith JSON payloads, SDK telemetry, and code sandbox).
* **Handwritten Editorial Notes:** `Caveat` or `Patrick Hand` (Small coral/terracotta margin notes and callout arrows: *"3 clicks to Bayesian certainty"*).

### 1.3 Tactile Components & Micro-Interactions
* **Keyboard Hotkey & Identity Badges:** Crisp rounded pills with subtle bottom borders (`border-b-2 border-stone-300 bg-stone-100 text-stone-700 font-mono text-xs px-2 py-0.5`).
* **Interactive Round Navigator:** The 4-step diagram inspired by the project blueprint (Round 01 to 04) rendered as tactile editorial nodes connected by clean dotted lines, with interactive JSON inspector slide-outs.
* **Toast Notification Stream:** Bottom-right warm toast cards sliding in with real-time exposure & conversion pings (`EXPOSURE: user_981a -> Variant B`).

---

## 🏗️ 2. Core Modules & Screen Breakdown

### Screen 1: The Dual-Panel Copilot & Experimenter HUD (`/`)
* **Header & Identity HUD:**
  * Brand mark: **RouteSmith** (Editorial serif + tactile pill `Powered by Flagsmith`).
  * Live Identity Badge: Shows active `user_id` (e.g. `user_8841f`), assigned RAG variant, and active traits.
  * **"New User Session" (1-Click Switcher):** Instantly rolls a fresh UUID (`flagsmith.identify()`), dynamically switching the UI variant live based on the 33/33/34 traffic split.
  * Secondary flag pills: `semantic_cache: ON/OFF`, `context_tokens: 2048/4096`.
* **Interactive 4-Round Interactive Visualizer (Collapsible Top Rail):**
  * Step 01: Multivariate Flag (`rag_pipeline_strategy`)
  * Step 02: Pick Conversion Metric (`answer_resolved`)
  * Step 03: Split Traffic & Ingest Events (1,500 identities)
  * Step 04: Bayesian Evaluation & Winner Rollout (`P(B wins) = 97.4%`)
  * Clicking any node opens an inspection drawer showing the exact Flagsmith SDK request/response JSON payload.
* **Split Layout:**
  * **Left Panel (Docs & Query Copilot):**
    * Query input with suggested technical edge-case prompts (e.g. *"How do I track traits in Flagsmith Python async SDK?"*).
    * Streaming answer with rich markdown and syntax-highlighted code.
    * **Action Bar:** "Copy Working Code", "Run in Sandbox", "Mark as Resolved".
    * Latency & Token Cost counters dynamically reflecting the active variant's performance ($540\text{ ms}$ vs $1080\text{ ms}$ vs $2810\text{ ms}$).
  * **Right Panel (Live Sandbox & Telemetry Stream):**
    * In-browser live Python/TypeScript syntax sandbox where users test the code.
    * Real-time event log showing the negative guardrail (if error prompt submitted within 30s, conversion is suppressed).

---

### Screen 2: The Swarm Traffic Simulator & Experiment Lab (`/lab`)
* **Editorial Hero:**
  * Title: *"1,500 Developers. Zero Guesswork."* with highlighter brush accent.
  * Subtitle: *"Run synthetic developer swarms across your multivariate flag and watch Bayesian convergence live."*
* **Controls:**
  * Swarm Volume Slider: $100$ to $2,000$ identities (default: $1,500$).
  * Persona Weight Distribution: The Impatient Hacker (latency sensitive), The Senior Architect (accuracy sensitive), The Pragmatist.
  * **"Run Live Experiment Swarm" Action Pill.**
* **Live Ingestion Progress & Telemetry Wall:**
  * Real-time counter of exposures and conversions streaming into Flagsmith Managed Warehouse.
  * Live status grid visualizing 1,500 colored identity dots firing in batches.

---

### Screen 3: Bayesian Analytics & 1-Click Rollout Deck (`/analytics` or embedded tab)
* **3 Variant Metric Cards:**
  * **Variant A (`fast_zero_shot`):** 500 exposures, 56 conversions ($11.2\%$), $540\text{ ms}$ avg latency.
  * **Variant B (`clustered_hybrid_rag`):** 500 exposures, 124 conversions ($24.8\%$), $1080\text{ ms}$ avg latency — **Winner Badge**.
  * **Variant C (`agentic_self_reflection`):** 500 exposures, 83 conversions ($16.5\%$), $2810\text{ ms}$ avg latency.
* **Bayesian Posterior Distribution Chart:**
  * Interactive SVG curves showing the 3 Beta distributions $\text{Beta}(\alpha + y, \beta + n - y)$ overlapping.
  * Clear visual indicator of Variant B's distribution dominating Variant A and C.
  * Win probability meter: **$97.4\%$ Win Probability** ($+121.4\%$ relative lift).
* **"Ship the Winner" Action Button:**
  * Lights up once win probability crosses $95\%$.
  * Promotes Variant B to $100\%$ production traffic (`0 / 100 / 0`) via Flagsmith Admin API.

---

## ⚙️ 3. Full-Stack Technical Architecture

### 3.1 Backend Architecture (FastAPI & Flagsmith SDK)
```
backend/
├── app/
│   ├── main.py                     # API entrypoint, CORS, exception handlers
│   ├── config.py                   # Flagsmith & provider keys
│   ├── flagsmith_service.py        # Server-side Flagsmith SDK client & identity evaluation
│   ├── admin_api.py                # Flagsmith Admin API wrapper (PUT /multivariate-feature-states)
│   ├── pipelines/
│   │   ├── router.py               # Dynamic pipeline selector based on active flag
│   │   ├── fast_zero_shot.py       # Top-3 vector search, low-latency prompt
│   │   ├── clustered_hybrid_rag.py # Semantic cluster + BM25 keyword rerank
│   │   └── agentic_self_reflection.py # Generator-critic AST syntax validator
│   ├── simulator/
│   │   ├── personas.py             # Persona heuristics (latency dropoff, accuracy threshold)
│   │   ├── swarm_worker.py         # Concurrent synthetic identity generator
│   │   └── bayesian_math.py        # Closed-form Beta PDF & Monte Carlo Win Probability
│   └── docs/                       # Technical documentation corpus (Flagsmith docs, async API)
└── requirements.txt
```

### 3.2 Frontend Architecture (Next.js 15 App Router & Tailwind)
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Google Fonts (Instrument Serif, Geist, JetBrains Mono)
│   │   ├── page.tsx                # Unified Copilot & Experimenter workspace
│   │   └── globals.css             # Custom utility classes, highlighter brush, tactile borders
│   ├── components/
│   │   ├── ui/                     # Tactile buttons, sliders, dialogs, badges
│   │   ├── header/                 # Brand, identity switcher, session HUD
│   │   ├── round-flow/             # 4-Round Interactive Architecture Diagram
│   │   ├── copilot/                # Chat query box, answer stream, code sandbox, action buttons
│   │   ├── simulator/              # Swarm controls, progress bar, dot visualizer
│   │   ├── analytics/              # Beta distribution curves, variant cards, promote button
│   │   └── telemetry/              # Live sliding toast stream
│   └── lib/
│       ├── api.ts                  # Backend REST client
│       └── flagsmith.ts            # Client-side Flagsmith SDK initialization
└── package.json
```

---

## 🗓️ 4. Phased Implementation Roadmap

### Phase 1: Foundation & Design System Setup
- [ ] Initialize Next.js 15 project with Tailwind CSS and custom fonts (Instrument Serif + Geist Sans + JetBrains Mono).
- [ ] Implement design tokens: Warm cream canvas (`#FAF8F5`), ink `#181715`, highlighter accents, and tactile pill buttons.
- [ ] Setup FastAPI backend project with Flagsmith Python SDK and environment configuration.

### Phase 2: Dynamic RAG Pipelines & Backend Router
- [ ] Implement `flagsmith_service.py` to evaluate `rag_pipeline_strategy` per `identity_id`.
- [ ] Build the 3 RAG pipeline variants:
  - `fast_zero_shot`: Vector retrieval with instant inference (~540ms).
  - `clustered_hybrid_rag`: Semantic chunk clustering + BM25 reranking (~1080ms).
  - `agentic_self_reflection`: Two-pass generator and critic loop (~2810ms).
- [ ] Connect secondary flags: `enable_semantic_cache` and `max_context_tokens`.

### Phase 3: Developer Copilot UI & Metric Tracking
- [ ] Build glassmorphic/tactile Header with Live Identity Badge & 1-Click Identity Switcher.
- [ ] Build Copilot query box with pre-configured developer documentation queries.
- [ ] Build Code Sandbox with "Copy Working Code" and "Run Snippet" triggers.
- [ ] Wire the `answer_resolved` conversion metric to Flagsmith SDK with the 30-second error suppression guardrail.
- [ ] Add sliding real-time Telemetry Toast Stream.

### Phase 4: The 4-Round Lifecycle Visualizer
- [ ] Recreate the interactive 4-Round architecture diagram from the reference blueprints:
  - Round 1: Create Multivariate Flag
  - Round 2: Pick Conversion Metric
  - Round 3: Split Traffic & Ingest Events
  - Round 4: Bayesian Evaluation & Winner Rollout
- [ ] Enable interactive node inspection showing live SDK request/response JSON payloads.

### Phase 5: Swarm Traffic Simulator & Bayesian Engine
- [ ] Implement `swarm_worker.py` to concurrently simulate 100–2,000 developer identities.
- [ ] Implement persona behavioral modeling (latency vs. accuracy conversion heuristics).
- [ ] Implement `bayesian_math.py` with Beta distribution computation and Monte Carlo sampling (100k iterations).
- [ ] Render interactive Beta distribution curve charts with confidence intervals.

### Phase 6: 1-Click Winner Rollout & Admin API
- [ ] Connect `admin_api.py` to the Flagsmith Admin API to update traffic weights from `33/33/34` to `0/100/0`.
- [ ] Add the "Promote Variant B to 100% Production" action button with confirmation state and toast verification.

---

## 🎯 5. Verification & Acceptance Criteria
1. **Design Authenticity:** No purple neon or generic AI templates; looks like an editorial, human-crafted developer tool (like LocalFlow).
2. **Deterministic Hashing:** Switching identities deterministically changes assigned variants according to 33/33/34 split.
3. **Real Metric Tracking:** Clicking "Copy Code" sends real `answer_resolved` events to Flagsmith.
4. **Swarm Convergence:** Simulating 1,500 users produces the exact statistically significant results ($11.2\%$ vs $24.8\%$ vs $16.5\%$) converging on $97.4\%$ win probability.
5. **Zero-Downtime Rollout:** Clicking promote immediately locks production traffic to Variant B via the Flagsmith Admin API.

