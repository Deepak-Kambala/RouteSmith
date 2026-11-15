# SearchForge // Flagsmith Experimentation Workbench (Track 01)

> **"Which ranking strategy helps developers find and use the right documentation?"**
>
> An experimentation workbench that compares Lexical BM25, Semantic Search, and Hybrid RRF behind Flagsmith feature flags, strictly distinguishing offline retrieval evaluation from user A/B experimentation.

---

## 1. Problem Statement & Intended User

Developers building with complex frameworks and SDKs rely heavily on documentation search. When search fails, engineering velocity slows, support tickets rise, and users bounce.

Search infrastructure teams are stuck choosing between:
1. **Lexical Search (BM25Okapi):** Fast and precise for exact method names, error codes, and flags (`get_identity_flags`), but blind to conceptual phrasing.
2. **Dense Semantic Search:** Captures high-level intent, but hallucinates or drops exact function names and introduces latency risks.
3. **Hybrid Reciprocal Rank Fusion (RRF):** Blends both, but deploying it without experimentation risks degrading search quality and breaking latency SLAs.

**SearchForge** is designed for **Search, ML, and Platform Engineers** who want to evaluate, test, and safely roll out new search ranking strategies using **Flagsmith Feature Flags, Remote Config, and Bayesian Experimentation** without external API costs or uncontrolled production risks.

---

## 2. Core Question, Hypothesis & Metrics

### The Core Question
> **“Which ranking strategy helps developers find and use the right documentation?”**

### The Hypothesis
> Serving Hybrid Reciprocal Rank Fusion (RRF) ranking increases the proportion of search sessions where developers find and copy code snippets compared to baseline Lexical BM25.

### Primary Metric: Snippet Copy Rate
$$\text{Snippet Copy Rate} = \frac{\text{Unique Exposed Sessions with } \ge 1 \text{ Snippet Copy}}{\text{Total Unique Exposed Search Sessions}}$$

> [!IMPORTANT]
> **Metric Limitation Notice:** In developer documentation, copying a code snippet is an observable **proxy for usefulness** (the user found code worth integrating), **not definitive proof** that the user successfully completed their underlying task without bugs.

---

## 3. Dual-Mode Architecture: Strictly Decoupled Evidence

SearchForge maintains an uncompromising separation between offline benchmark evidence and user experiment evidence:

| Dimension | Mode A: Offline Retrieval Benchmark | Mode B: User Experiment (Flagsmith-Assigned) |
| :--- | :--- | :--- |
| **Evidence Type** | Algorithmic Retrieval Accuracy on Curated Queries | Behavioral Interaction on Served Results |
| **Data Source** | 150 categorized queries against 40 technical chunks | Real user search sessions in the workbench |
| **Primary Metrics** | **Recall@3**, **Precision@1**, **MRR@3**, Latency (ms) | **Snippet Copy Rate (%)**, Lift vs Control, Win Probability |
| **Relevance Rule** | Ground-truth binary target document match | Did the session user copy a served snippet? |
| **Variant Assignment**| All 3 algorithms evaluated against every test query | Flagsmith assigns 1 variant per unique session |
| **Statistical Model** | Empirical retrieval ratios over fixed test set | Conjugate Beta-Binomial Bayesian Posteriors $\text{Beta}(\alpha, \beta)$ |

---

## 4. Flagsmith Integration & Auditability

### How Flagsmith is Used
1. **Multivariate Feature Flag (`retrieval_ranking_engine`):**
   - Distributes incoming search traffic across three variants:
     - `lexical_bm25` (Control Baseline - 33.3%)
     - `semantic_dense` (Variant B - 33.3%)
     - `hybrid_rrf` (Variant C - 33.4%)
2. **Remote Configuration Parameters:**
   - `retrieval_ranking_engine_alpha`: Fusion balance factor (default `0.45`).
   - `retrieval_ranking_engine_rrf_k`: Rank smoothing constant (default `60`).
   - `retrieval_ranking_engine_code_boost`: Multiplier when code tokens are detected (default `1.35x`).
   - `retrieval_ranking_engine_latency_sla_ms`: Circuit breaker threshold (default `25.0ms`).
3. **Identity Traits & Segment Overrides:**
   - Evaluates traits via `flagsmith.get_identity_flags(identifier, traits)`:
     - `tier: "enterprise"` &rarr; Route to **Enterprise VIP Users** segment.
     - `has_error_code: true` &rarr; Route to **Error Code Diagnosticians** segment.
4. **Circuit Breaker Kill-Switch (`force_lexical_fallback`):**
   - Instantly forces sub-millisecond BM25 fallback to protect uptime if semantic models spike past SLA.

### Non-Negotiable Auditability & Non-Silent Fallback
- For every query, SearchForge exposes whether assignment came from:
  - **`LIVE FLAGSMITH EDGE`**: Successfully evaluated from active Flagsmith SDK.
  - **`LOCAL SIMULATION`**: Deterministic Murmur3 hash fallback (used when no key is set, or if `retrieval_ranking_engine` is unconfigured in the user's Flagsmith project).
- SearchForge **never silently falls back** while claiming Flagsmith assigned the variant.
- Since this integration evaluates flags via the SDK and logs events in the local analytical engine, it is accurately designated as a **"Flagsmith-assigned local experiment"**, not an internal Flagsmith Experimentation service.

---

## 5. Statistical Rigor & Bayesian Model

### Session Accounting & Attribution Safeguards
1. **Exposure Accounting:** Recorded **at most once per stable session ID** upon their first search query. Repeated searches or re-renders within the same session do not inflate exposure counts.
2. **Attribution Integrity:** Conversions are strictly attributed **only to the variant served to that specific session**.
3. **Deduplication:** A session can convert at most once. If a developer copies multiple snippets within one search session, it is recorded as a single successful session to prevent event inflation.
4. **Observation Window Rule:** A session without a copy event is counted as a non-conversion.

### Beta-Binomial Formulation
- **Prior:** Flat, uninformative prior $\text{Beta}(\alpha=1, \beta=1)$.
- **Posterior:** For each variant with $N$ unique exposed sessions and $k$ converted sessions:
  $$\alpha_{\text{post}} = 1 + k, \quad \beta_{\text{post}} = 1 + (N - k)$$
- **95% Credible Intervals:** Exact closed-form percentiles via `scipy.stats.beta.ppf([0.025, 0.975], \alpha, \beta)`.
- **Win Probability:** 10,000 independent draws from each posterior, calculating the probability that variant $v$ has the highest true conversion rate.

### Honest Status Determination (No Fabricated Winners)
- **`COLLECTING_EVIDENCE`:** Displayed when $N_{\text{total}} < 15$ or $N_{\text{ctrl}} < 5$. States clearly: *"Not enough evidence: Sample size too small. Credible intervals are wide."*
- **`INCONCLUSIVE`:** Displayed when sample size is sufficient, but no variant has achieved $\ge 95\%$ win probability or intervals overlap heavily.
- **`STATISTICAL_WINNER_DETECTED`:** Triggered only when a variant achieves $\ge 95\%$ win probability with positive relative lift over control.

---

## 6. Setup & Local Execution

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Start FastAPI Backend (Port 8000)
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```
*Health Check:* `curl http://127.0.0.1:8000/api/health`

### 2. Start Next.js Frontend (Port 3000)
```bash
cd frontend
npm install
npm run build
npm start
```
Open **`http://localhost:3000`** in your browser.

---

## 7. Recommended 3-Minute Demo Script

### Setup: Split Screen (65% SearchForge / 35% Flagsmith Dashboard)

#### ⏱️ Part 1: Problem & Product Question (0:00 - 0:45)
1. Point to the top banner:
   *"We are solving the core question: Which ranking strategy helps developers find and use the right documentation?"*
2. Point out the **Flagsmith Assignment Audit Badge**: Shows whether the active session was assigned via **LIVE FLAGSMITH EDGE** or **LOCAL SIMULATION**.
3. Click **"Key"** in the top bar to show the live runtime environment key modal.

#### ⏱️ Part 2: Tri-Pipeline Nuance & Attribution (0:45 - 1:30)
1. Click **`[Exact SDK]`** (`get_identity_flags transient`):
   - Notice **BM25 ranks #1**: *"Exact API function symbols need lexical precision. Dense vector search often fuzzifies exact function names."*
2. Click **`[Conceptual]`** (`gradually test two ranking algos`):
   - Notice **Dense SVD ranks #1**: *"Zero exact keyword overlap with docs, but semantic embeddings understand the intent."*
3. Click **`[Hybrid Code]`** (`override segment config enterprise`):
   - Notice **Hybrid RRF combines both**: Show the equation `[BM25: #2] + [Dense: #1] → RRF Final: #1` and the lexical/dense contribution bar.
4. Click **"Copy Code Snippet (Logs Real Conversion)"**:
   - Point out the toast: *"A real conversion event is logged and strictly attributed to the served variant for this session."*

#### ⏱️ Part 3: Dual-Mode Evidence & Reproducible Scenarios (1:30 - 2:30)
1. **Show Offline Retrieval Benchmark Tab:**
   - Click **"Offline Retrieval Benchmark"**.
   - Show the 150-query dataset metrics: Recall@3, Precision@1, MRR@3. Explain: *"This is offline benchmark evidence on labeled queries—never confused with user A/B traffic."*
2. **Switch back to "User Experiment (A/B)" Tab:**
   - Click **"Low Sample"**: Watch the status change to **"NOT ENOUGH EVIDENCE (N=12)"** with wide overlapping credible intervals.
   - Click **"BM25 Wins"**: Watch **lexical_bm25 Control** win when API reference queries dominate! Explain: *"This proves SearchForge is honest and not rigged to always pick hybrid."*
   - Click **"Hybrid Wins"**: Watch **hybrid_rrf** win (+81% lift, 98.7% win probability) on mixed developer traffic.

#### ⏱️ Part 4: Operational Safety & Rollout Governance (2:30 - 3:00)
1. Click **`[Latency Spike]`**:
   - Show the header flash: **`KILL-SWITCH ACTIVE: FORCED BM25`**.
   - *"If semantic latency spikes beyond our 25ms SLA, Flagsmith acts as a circuit breaker, instantly falling back to BM25 to protect search uptime."*
2. Point out the **Rollout Governance Control**:
   - *"Once statistical certainty is reached, traffic is rolled out by updating multivariate weights in Flagsmith with human approval."*
