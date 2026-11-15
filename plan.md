# SearchForge // Flagsmith Track 01 Architecture Plan
## Real-Time Hybrid Search & Reciprocal Rank Fusion (RRF) Experimentation Workbench

> "Which ranking strategy helps developers find and use the right documentation?"

---

### 1. Executive Summary & Problem Statement
Developers and technical teams rely heavily on documentation search to resolve errors, integrate SDKs, and understand concepts. However, search infrastructure teams face a critical dilemma:
1. **Lexical Search (BM25Okapi)** excels at exact API identifiers, method names, and error codes (`get_identity_flags`), but fails completely on conceptual queries.
2. **Dense Vector / Semantic Search** captures high-level conceptual intent, but frequently hallucinates or drops exact function names, is computationally expensive, and introduces latency risks.
3. **Hybrid Reciprocal Rank Fusion (RRF)** theoretically balances both, but deploying it without rigorous experimentation risks degrading production search quality.

**SearchForge** is a zero-API-cost, real-time experimentation workbench powered by Flagsmith. It allows engineering teams to safely evaluate, experiment with, and roll out search ranking engines in production using **Flagsmith feature flags, identity segmentation, remote configuration, and Bayesian mathematics**.

---

### 2. Track 01 Core Requirements & Architectural Mapping

| Track 01 Expectation | SearchForge Implementation |
| :--- | :--- |
| **A Clear Question** | *"Which ranking strategy helps developers find and use the right documentation?"* |
| **Versions Behind a Flag** | Flagsmith multivariate flag `retrieval_ranking_engine` distributing traffic across `lexical_bm25` (Control), `semantic_dense` (Variant B), and `hybrid_rrf` (Variant C). |
| **Metric from Real Events** | Primary Metric: **Snippet Copy Rate** (Sessions with $\ge 1$ snippet copy / Total exposed sessions). Explicitly noted as an observable proxy for usefulness, not definitive proof of task success. |
| **Explainable Results** | Conjugate Beta-Binomial Bayesian posteriors $\text{Beta}(\alpha, \beta)$ with closed-form 95% Credible Intervals via `scipy.stats.beta` and continuous win probability calculations. |
| **Auditability & Honesty** | Strict decoupling of offline retrieval benchmarks (Recall@3, MRR@3) from user A/B experimentation. Non-silent fallback reporting: clearly states whether assignment came from `LIVE FLAGSMITH EDGE` or `LOCAL SIMULATION`. |

---

### 3. Dual-Mode Analysis Architecture

#### Mode A: Offline Retrieval Benchmark (Curated Dataset Evidence)
- **Dataset:** 40 rich technical documentation chunks covering Flagsmith concepts and systems architecture, paired with 150 categorized benchmark queries (`sdk_exact`, `conceptual`, `hybrid_code`, `latency_edge`).
- **Relevance Assumption:** Binary ground-truth target document match.
- **Metrics Computed:**
  - Recall@1 (Precision@1)
  - Recall@3 (Proportion of queries where ground-truth document is retrieved in top 3)
  - Mean Reciprocal Rank (MRR@3)
  - Execution Latency (sub-millisecond CPU execution)
- **Categorical Findings:**
  - `sdk_exact` queries: BM25 achieves highest precision.
  - `conceptual` queries: Dense SVD achieves highest recall.
  - `hybrid_code` queries: Hybrid RRF achieves highest overall retrieval accuracy.

#### Mode B: User A/B Experiment (Flagsmith-Assigned Local Experiment)
- **Hypothesis:** Serving Hybrid RRF ranking increases the proportion of search sessions where developers find and copy code snippets compared to baseline BM25.
- **Session Accounting:** Exposures recorded once per stable session ID. Conversions deduplicated (maximum 1 per session) and strictly attributed to the served variant.
- **Priors:** Flat uniform prior $\text{Beta}(1, 1)$.
- **Status & Winner Rules:**
  - `COLLECTING_EVIDENCE`: Minimum 15 total sessions and 5 control sessions required before evaluating statistical significance.
  - `INCONCLUSIVE`: Sample size sufficient, but no variant has achieved $\ge 95\%$ win probability or credible intervals overlap heavily.
  - `STATISTICAL_WINNER_DETECTED`: Triggered only when a variant achieves $\ge 95\%$ win probability with positive relative lift over control.
- **Reproducible Walkthrough Scenarios:**
  - `inconclusive_low_sample`: Demonstrates honest "Not enough evidence" banner on low sample ($N=12$).
  - `sdk_exact_bm25_wins`: Demonstrates `lexical_bm25` control WINNING on API reference traffic (proves no rigging).
  - `mixed_traffic_hybrid_wins`: Demonstrates `hybrid_rrf` winning on mixed technical traffic.
  - `reset`: Resets state to 0 evidence.

---

### 4. Flagsmith Feature Flags & Remote Configuration

1. **Multivariate Feature Flag:** `retrieval_ranking_engine`
   - Control: `lexical_bm25` (33.3%)
   - Variant B: `semantic_dense` (33.3%)
   - Variant C: `hybrid_rrf` (33.4%)
2. **Emergency Kill-Switch:** `force_lexical_fallback`
   - Circuit breaker: Instantly forces sub-millisecond BM25 if upstream vector search exceeds latency SLA.
3. **Remote Configuration Parameters:**
   - `retrieval_ranking_engine_alpha`: Fusion blend factor (default `0.45`).
   - `retrieval_ranking_engine_rrf_k`: Rank constant (default `60`).
   - `retrieval_ranking_engine_code_boost`: Code token multiplier (default `1.35x`).
   - `retrieval_ranking_engine_latency_sla_ms`: Latency budget (default `25.0ms`).
4. **Identity Traits & Segment Overrides:**
   - `tier: "enterprise"` &rarr; Segment Override to `Enterprise VIP Users`
   - `has_error_code: true` &rarr; Segment Override to `Error Code Diagnosticians`
