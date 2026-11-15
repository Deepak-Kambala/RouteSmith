# SearchForge // Flagsmith Bayesian Bench

> **Zero-API-cost, real-time Hybrid Search & Reciprocal Rank Fusion (RRF) Bayesian Experimentation Workbench powered by Flagsmith.**

SearchForge is a production-grade developer tool designed for evaluating, experimenting with, and statistically validating hybrid search retrieval engines. It demonstrates how engineering teams can use **Flagsmith Feature Flags & Remote Config** to safely deploy, benchmark, and optimize multiple search algorithms (`lexical_bm25`, `semantic_dense`, and `hybrid_rrf`) with zero external API fees, sub-5ms CPU latency, and real-time Bayesian decision theory.

---

## 1. Architectural Principles & Anti-Bloat Scope

- **Zero-API-Cost & Sub-5ms Local Execution:** 100% local CPU execution. No paid external LLM APIs, no heavy embedding model downloads, and no external vector databases.
- **In-Memory 40-Doc Developer Corpus:** Rich developer documentation covering Flagsmith SDKs, remote config, segment overrides, and distributed systems patterns.
- **Zero-Scroll Single Viewport (`100vw x 100vh`):** Locked desktop layout specifically engineered to be recorded side-by-side (65% width) next to the official Flagsmith Dashboard (35% width) in a 3-minute hackathon demo video.

---

## 2. Visual Design System ("Swiss Industrial Telemetry + Micro-Glass")

Inspired by Linear, Vercel Observability, and Raycast:

- **Base Canvas:** Deep Carbon Obsidian (`#07080C`) with a radial dot-matrix pattern (`radial-gradient(#1E2230 1px, transparent 1px)` at `16px` intervals).
- **Primary Bento Panels:** Tactile matte `#0D0F17` surfaces with `1px solid #1C2030` exposed structural hairline borders and a top specular highlight (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]`).
- **Floating HUD & Pill Inspector:** Acrylic glassmorphism (`bg-[#131724]/80 backdrop-blur-md border border-white/10`).
- **Strict Semantic Color Encoding:**
  - **Control (`lexical_bm25`):** Amber Gold (`#F59E0B`, `bg-amber-500/10 text-amber-400 border-amber-500/30`)
  - **Variant B (`semantic_dense`):** Cyan Electric (`#06B6D4`, `bg-cyan-500/10 text-cyan-400 border-cyan-500/30`)
  - **Variant C (`hybrid_rrf` - The Winner):** Emerald Matrix (`#10B981`, `bg-emerald-500/10 text-emerald-400 border-emerald-500/30`)
  - **Kill-Switch Fallback (`force_lexical_fallback`):** Crimson Pulse (`#F43F5E`, pulsing border `border-rose-500/60 bg-rose-950/30`)

---

## 3. The 4-Quadrant Viewport Architecture

```
+-----------------------------------------------------------------------------------------------+
|  ⚡ SEARCHFORGE // FLAGSMITH BAYESIAN BENCH   [LIVE: Flagsmith Edge]  [Remote Config HUD]  [Kill-Switch]  |
+-------------------------------------------------------+---------------------------------------+
| QUADRANT 1: QUERY & TRAIT INSPECTOR (5 cols, 42% H)   | QUADRANT 3: BAYESIAN EXPERIMENT ARENA  |
| - High-contrast search input with ⌘K & CPU latency   | - Primary CTA: Stream 150 Queries     |
| - 4 One-click demo preset chips                       | - 3-Variant Bayesian comparison matrix |
| - Flagsmith identity & trait JSON inspector card      | - Live 95% Credible Interval Beta plot|
|                                                       | - 🏆 Statistical Winner Alert Banner   |
+-------------------------------------------------------+---------------------------------------+
| QUADRANT 2: TRI-PIPELINE RANK DIFF (5 cols, 58% H)    | QUADRANT 4: LIVE TELEMETRY STREAM      |
| - Top 3 retrieved documentation chunk cards           | - Vercel/Datadog-style live tail      |
| - Rank Fusion Equation: [BM25:#4]+[Dense:#2]->[RRF:#1]| - Single-line telemetry with badges   |
| - Lexical vs Dense contribution horizontal bar        | - Real-time HIT/MISS & event logging  |
| - Copy Code Snippet (Fires Conversion Event)          |                                       |
+-------------------------------------------------------+---------------------------------------+
```

---

## 4. Mathematical & Algorithmic Foundation

### A. BM25Okapi (Lexical Engine)
Evaluates exact term frequency and document length saturation:
$$\text{Score}_{\text{BM25}}(D, Q) = \sum_{q \in Q} \text{IDF}(q) \cdot \frac{f(q, D) \cdot (k_1 + 1)}{f(q, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$
*Parameters: $k_1 = 1.5, b = 0.75$.*

### B. Dense Semantic Vector Search (CPU SVD)
Calculates TF-IDF over word and character 1-2 n-grams, projected into a 32-dimensional latent semantic space via `TruncatedSVD(n_components=32)`, unit-normalized ($\|v\|_2 = 1$), and evaluated via dot product cosine similarity in $<2\text{ms}$.

### C. Reciprocal Rank Fusion (RRF) with Remote Config
Fuses independent ordinal ranking pipelines without requiring score calibration:
$$\text{RRF Score}(d) = \frac{\alpha}{\text{rrf\_k} + r_{\text{bm25}}(d)} + \frac{(1 - \alpha) \cdot \text{code\_boost}}{\text{rrf\_k} + r_{\text{dense}}(d)}$$
*Defaults managed via Flagsmith Remote Config: $\alpha = 0.45, \text{rrf\_k} = 60, \text{code\_boost} = 1.35\times$.*

### D. Conjugate Beta-Binomial Bayesian Model
Models true conversion rate $\theta_i$ for each variant using a conjugate uniform prior $\text{Beta}(1, 1)$. Upon observing $N_i$ exposures and $k_i$ conversions:
$$\theta_i \sim \text{Beta}(\alpha_0 + k_i, \, \beta_0 + N_i - k_i)$$
- **Monte Carlo Win Probability:** Evaluated across 10,000 independent draws from all 3 posterior Beta distributions.
- **95% Credible Intervals:** Exact $2.5^{\text{th}}$ and $97.5^{\text{th}}$ empirical percentiles.

---

## 5. Flagsmith Remote Configuration & Feature Flags

| Flag Key | Type | Description |
| :--- | :--- | :--- |
| `retrieval_ranking_engine` | Multivariate (String) | Splits traffic between `lexical_bm25`, `semantic_dense`, and `hybrid_rrf`. |
| `retrieval_ranking_engine_alpha` | Remote Config (Float) | Weight for lexical vs dense fusion (default: `0.45`). |
| `retrieval_ranking_engine_rrf_k` | Remote Config (Integer) | RRF rank smoothing constant (default: `60`). |
| `retrieval_ranking_engine_code_boost` | Remote Config (Float) | Boost multiplier for queries containing code syntax (default: `1.35`). |
| `retrieval_ranking_engine_latency_sla_ms`| Remote Config (Float) | Maximum allowed latency threshold before circuit breaking (default: `25.0`). |
| `force_lexical_fallback` | Feature Flag (Boolean) | **Kill-switch**: Instantly degrades traffic to pure BM25 during outages. |

---

## 6. Quickstart & Demo Flow

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Launch Backend (Port 8000)
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Launch Frontend (Port 3000)
```bash
cd frontend
npm install
npm run build
npm start
```
Open **`http://localhost:3000`** in your browser.

---

## 7. Recommended 3-Minute Demo Script

1. **Top Bar & Flagsmith Inspector (0:00 - 0:45):**
   - Point out the active Flagsmith connection status pill and live remote config HUD.
   - Click **"🔑 Key"** in the top bar to show the Glassmorphic runtime environment key configuration modal.
2. **Demo Preset Chips & Rank Diff (0:45 - 1:30):**
   - Click `[Exact SDK]` &rarr; notice BM25 ranks #1 because of exact symbol match.
   - Click `[Conceptual]` &rarr; notice Dense Vector SVD ranks #1 because of semantic intent.
   - Click `[Hybrid Code]` &rarr; notice Hybrid RRF balances both with contribution bars.
   - Click **"Copy Code Snippet (Fire Conversion)"** &rarr; watch the toast flash and live conversion counter tick.
3. **Stream 150 Benchmark Queries (1:30 - 2:30):**
   - Click **"▶ Stream 150 Real Queries (Bayesian Benchmark)"**.
   - Watch the 3-variant comparison matrix populate in real time.
   - Watch the SVG Beta posterior distribution curves separate cleanly as evidence accumulates.
   - Show the **Statistical Winner Banner**: `🏆 STATISTICAL WINNER DETECTED: hybrid_rrf (+36.2% Lift, 97.4% Win Prob)`.
4. **Kill-Switch Circuit Breaker (2:30 - 3:00):**
   - Click `[⚡ Simulate Latency Spike]` &rarr; watch the header flash `🚨 KILL-SWITCH ACTIVE: FORCED BM25 FALLBACK` demonstrating immediate safe degradation.
