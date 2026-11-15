"""
SearchForge Developer Documentation Corpus
40 rich documentation chunks covering Flagsmith, Search Algorithms, and Systems Architecture.
Paired with 150 ground-truth benchmark queries for Bayesian evaluation.
"""

from typing import List, Dict, Any

DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "doc_01",
        "title": "Flagsmith Python SDK: get_identity_flags & Transient Traits",
        "category": "SDK & Identity",
        "snippet": "flags = flagsmith.get_identity_flags(identifier='usr_123', traits={'tier': 'enterprise', 'has_error_code': True})",
        "text": "The Flagsmith Python SDK evaluates feature flags for specific user identities using get_identity_flags. You can supply transient traits that are evaluated in-memory for segmentation without persisting them to Flagsmith database storage.",
        "tags": ["flagsmith", "sdk", "python", "get_identity_flags", "traits", "transient"]
    },
    {
        "id": "doc_02",
        "title": "Multivariate Feature Flags & Traffic Weight Distribution",
        "category": "Experimentation",
        "snippet": "variant = flags.get_feature_value('retrieval_ranking_engine') # Returns: lexical_bm25 | semantic_dense | hybrid_rrf",
        "text": "Multivariate flags split user traffic across multiple variations using stable Murmur3 hashing. Each variant receives an allocated percentage weight ensuring consistent user assignment across repeated evaluation cycles.",
        "tags": ["multivariate", "ab_testing", "weights", "variants", "murmur3", "flagsmith"]
    },
    {
        "id": "doc_03",
        "title": "Flagsmith Server-Side Local Evaluation Mode",
        "category": "Performance",
        "snippet": "flagsmith = Flagsmith(environment_key=KEY, enable_local_evaluation=True, environment_refresh_interval_seconds=60)",
        "text": "Local evaluation mode downloads the Flagsmith environment document once and performs all flag and trait evaluations locally in CPU memory in under 0.1ms without network HTTP hops to the Flagsmith Edge API.",
        "tags": ["local_evaluation", "latency", "sub_millisecond", "performance", "caching"]
    },
    {
        "id": "doc_04",
        "title": "Flagsmith Segment Overrides & Rules Engine",
        "category": "Segmentation",
        "snippet": "segment_rule = {'property': 'tier', 'operator': 'EQUAL', 'value': 'enterprise'}",
        "text": "Segment overrides allow targeting specific cohorts of users based on traits. An enterprise segment override can immediately direct VIP users to a dedicated ranking engine or feature set before standard multivariate rollouts.",
        "tags": ["segments", "overrides", "rules", "cohorts", "enterprise", "targeting"]
    },
    {
        "id": "doc_05",
        "title": "Reciprocal Rank Fusion (RRF) Formula & Parameter Tuning",
        "category": "Search Systems",
        "snippet": "rrf_score = sum(weight / (rrf_k + rank_i) for rank_i, weight in rankings)",
        "text": "Reciprocal Rank Fusion combines ordinal ranks from disparate search retrieval pipelines without requiring calibrated score normalization. Parameter k=60 prevents low-ranked outliers from skewing top reciprocal score sums.",
        "tags": ["rrf", "reciprocal_rank_fusion", "hybrid_search", "ranking", "algorithms"]
    },
    {
        "id": "doc_06",
        "title": "BM25 Lexical Ranking with Term Frequency & Document Length",
        "category": "Search Systems",
        "snippet": "score = idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc_len / avg_len)))",
        "text": "BM25Okapi is the industry standard lexical search algorithm. It excels at exact keyword matching, code identifier retrieval, and acronyms while penalizing overly long documents via saturation parameters k1=1.5 and b=0.75.",
        "tags": ["bm25", "lexical", "exact_match", "information_retrieval", "tf_idf"]
    },
    {
        "id": "doc_07",
        "title": "Dense Vector Embeddings via TruncatedSVD for Sub-5ms CPU Search",
        "category": "Search Systems",
        "snippet": "svd = TruncatedSVD(n_components=32, random_state=42); query_vec = svd.transform(tfidf_vec)",
        "text": "Low-rank latent semantic analysis using TruncatedSVD projects high-dimensional character and word n-grams into 32 compact dimensions, enabling ultra-fast vector dot-product similarity computation on commodity CPU hardware in <2ms.",
        "tags": ["dense", "vector", "semantic_search", "svd", "cosine_similarity", "embeddings"]
    },
    {
        "id": "doc_08",
        "title": "Beta-Binomial Bayesian A/B Experimentation Engine",
        "category": "Bayesian Analytics",
        "snippet": "posterior_alpha = prior_alpha + successes; posterior_beta = prior_beta + (trials - successes)",
        "text": "Bayesian A/B testing models conversion rates using conjugate Beta distributions. Unlike classical p-values requiring rigid sample sizes, Bayesian posteriors yield exact probability distributions of one search variant beating another at any moment.",
        "tags": ["bayesian", "beta_distribution", "posteriors", "credible_intervals", "monte_carlo"]
    },
    {
        "id": "doc_09",
        "title": "Flagsmith Kill-Switch Circuit Breaker & Fallback Strategy",
        "category": "Reliability",
        "snippet": "if flags.is_feature_enabled('force_lexical_fallback') or latency > sla: return fallback_bm25(query)",
        "text": "A remote kill-switch allows operations teams to instantly shut down degraded downstream components like vector search during traffic spikes or outages, falling back to reliable pure lexical search without restarting application processes.",
        "tags": ["kill_switch", "circuit_breaker", "fallback", "sla", "reliability", "degraded_mode"]
    },
    {
        "id": "doc_10",
        "title": "Tracking Experiment Conversion Events with Flagsmith Analytics",
        "category": "Telemetry",
        "snippet": "await flagsmith.track_event(identifier=user_id, event_name='doc_snippet_resolved')",
        "text": "Measuring experiment success requires correlating feature flag exposures with conversion telemetry. Logging events like doc_snippet_resolved allows automated statistical evaluation of which ranking variant drove user resolution.",
        "tags": ["telemetry", "track_event", "conversions", "analytics", "experiments"]
    },
    {
        "id": "doc_11",
        "title": "Flagsmith Remote Config for Real-Time Hyperparameter Tuning",
        "category": "Remote Config",
        "snippet": "alpha = float(flags.get_feature_value('retrieval_ranking_engine_alpha') or 0.45)",
        "text": "Remote Config enables dynamically altering operational parameters like RRF blend weight alpha and code token boost multipliers in production without code deployments or configuration file updates.",
        "tags": ["remote_config", "hyperparameters", "dynamic_tuning", "flagsmith"]
    },
    {
        "id": "doc_12",
        "title": "Mean Reciprocal Rank (MRR@3) for Search Benchmark Evaluation",
        "category": "Search Systems",
        "snippet": "mrr = sum(1.0 / rank for rank in hit_ranks if rank <= 3) / total_queries",
        "text": "Mean Reciprocal Rank at position 3 quantifies how effectively a ranking algorithm places the correct documentation chunk into the user visible viewport, rewarding top-1 placements with score 1.0 and rank 2 with 0.5.",
        "tags": ["mrr", "evaluation", "metrics", "benchmarks", "information_retrieval"]
    },
    {
        "id": "doc_13",
        "title": "Flagsmith Edge API vs Core API Architecture",
        "category": "Architecture",
        "snippet": "edge_client = Flagsmith(environment_key='ser.xxx', api_url='https://edge.api.flagsmith.com/api/v1/')",
        "text": "Flagsmith Edge API is globally distributed across edge points of presence, providing sub-20ms HTTP flag resolution and high availability worldwide for cloud-native applications.",
        "tags": ["edge_api", "architecture", "global_distribution", "latency"]
    },
    {
        "id": "doc_14",
        "title": "FastAPI Async Endpoints for Real-Time Query Evaluation",
        "category": "FastAPI",
        "snippet": "@app.post('/api/search')\nasync def search(req: SearchRequest): return await engine.search(req.query)",
        "text": "Asynchronous request handling in FastAPI prevents thread starvation during concurrent search requests, delivering predictable sub-5ms latencies across hundreds of simulated client streams.",
        "tags": ["fastapi", "async", "high_throughput", "python", "endpoints"]
    },
    {
        "id": "doc_15",
        "title": "Monte Carlo Win Probability Sampling for A/B/n Tests",
        "category": "Bayesian Analytics",
        "snippet": "samples = [np.random.beta(a, b, size=10000) for a, b in posteriors]; win_rate = np.mean(samples[2] > samples[0])",
        "text": "Generating 10,000 independent draws from each variant's posterior Beta distribution yields the empirical probability that variant C has a higher true conversion rate than control and variant B.",
        "tags": ["monte_carlo", "win_probability", "simulation", "bayesian", "statistics"]
    },
    {
        "id": "doc_16",
        "title": "Flagsmith SDK Key Security: Client-Side vs Server-Side Keys",
        "category": "Security",
        "snippet": "server_key = 'ser.xxx' # Keep secret in backend; client_key = 'cli.xxx' # Safe for browser bundle",
        "text": "Server-side environment keys prefixed with ser. provide privileged access to local evaluation documents and administrative features and must remain in secure backend environment variables.",
        "tags": ["security", "api_keys", "server_key", "client_key", "best_practices"]
    },
    {
        "id": "doc_17",
        "title": "Query Intent Routing: Lexical for Code, Dense for Concepts",
        "category": "Hybrid Search",
        "snippet": "has_code = bool(re.search(r'[_().:\\[\\]]', query)); weight_bm25 = 0.65 if has_code else 0.35",
        "text": "Detecting programming language syntax and function call patterns in queries allows adaptive reweighting of lexical vs semantic retrieval before rank fusion occurs.",
        "tags": ["intent_routing", "code_detection", "adaptive_ranking", "hybrid_search"]
    },
    {
        "id": "doc_18",
        "title": "Flagsmith Audit Logs & Compliance Tracking",
        "category": "Governance",
        "snippet": "audit_record = {'user': 'dev_admin', 'action': 'TOGGLE_FEATURE', 'feature': 'hybrid_rrf', 'timestamp': '2026-05-11'}",
        "text": "Flagsmith maintains immutable audit logs recording every feature toggle, segment modification, and environment configuration change for compliance and team visibility.",
        "tags": ["audit_logs", "compliance", "governance", "security"]
    },
    {
        "id": "doc_19",
        "title": "L2 Normalization & Cosine Similarity in High Dimensions",
        "category": "Mathematics",
        "snippet": "norm_vec = vec / np.linalg.norm(vec); cosine_sim = np.dot(query_norm, doc_norm)",
        "text": "Normalizing embedding vectors to unit Euclidean norm converts cosine distance calculation into a single matrix dot product, maximizing SIMD vectorization on modern CPUs.",
        "tags": ["math", "cosine_similarity", "l2_norm", "linear_algebra", "simd"]
    },
    {
        "id": "doc_20",
        "title": "Flagsmith Feature Flag Change Requests & Four-Eyes Approval",
        "category": "Governance",
        "snippet": "change_request = {'target_state': True, 'reviewers': ['tech_lead'], 'status': 'PENDING_APPROVAL'}",
        "text": "Change requests enforce a two-person approval process before critical feature flags can be toggled in production environments, preventing accidental rollouts.",
        "tags": ["change_requests", "approval", "production_safety", "governance"]
    },
    {
        "id": "doc_21",
        "title": "Handling Out-of-Vocabulary (OOV) Terms in Hybrid Search",
        "category": "Search Systems",
        "snippet": "if token not in vocabulary: fallback_to_char_ngrams(token, min_n=3, max_n=5)",
        "text": "Subword character n-grams bridge the vocabulary mismatch problem when developers search for misspelled API method names or novel error codes not present in training sets.",
        "tags": ["oov", "subword", "character_ngrams", "robustness"]
    },
    {
        "id": "doc_22",
        "title": "Flagsmith React & Next.js SDK Integration Pattern",
        "category": "Frontend SDK",
        "snippet": "<FlagsmithProvider flagsmith={flagsmith} serverState={flagsmithState}><SearchHUD /></FlagsmithProvider>",
        "text": "Integrating Flagsmith into Next.js allows hydrating initial server-side evaluated flag states into client components without layout shift or loading spinners.",
        "tags": ["react", "nextjs", "frontend", "hydration", "ssr"]
    },
    {
        "id": "doc_23",
        "title": "Bayesian Credible Intervals vs Classical Confidence Intervals",
        "category": "Bayesian Analytics",
        "snippet": "ci_lower = stats.beta.ppf(0.025, alpha, beta); ci_upper = stats.beta.ppf(0.975, alpha, beta)",
        "text": "A 95% Bayesian credible interval states that there is a 95% subjective probability that the true conversion rate lies between bounds, offering intuitive interpretation for product teams.",
        "tags": ["credible_intervals", "statistics", "bayesian", "confidence_intervals"]
    },
    {
        "id": "doc_24",
        "title": "Flagsmith Model Context Protocol (MCP) Server Integration",
        "category": "AI & Tools",
        "snippet": "mcp_tool = {'name': 'flagsmith_evaluate', 'params': {'flag': 'retrieval_ranking_engine'}}",
        "text": "The Flagsmith Model Context Protocol server connects AI coding assistants and agents directly to feature flag environments for automated experiment creation and canary analysis.",
        "tags": ["mcp", "ai_agent", "tools", "flagsmith_mcp"]
    },
    {
        "id": "doc_25",
        "title": "Query Tokenization & Code Symbol Preservation",
        "category": "Search Systems",
        "snippet": "tokens = re.findall(r'[A-Za-z0-9_]+|[\\.\\(\\)\\[\\]\\-\\>]+', query.lower())",
        "text": "Preserving programming symbols like dots, underscores, and arrows during tokenization is crucial for distinguishing between method invocations and prose text.",
        "tags": ["tokenization", "code_search", "regex", "parsing"]
    },
    {
        "id": "doc_26",
        "title": "Flagsmith Identity Override Precedence in Evaluation Hierarchy",
        "category": "Flagsmith Core",
        "snippet": "hierarchy = [IdentityOverrides, SegmentOverrides, EnvironmentDefaults]",
        "text": "Flagsmith evaluates feature flags in strict order: individual identity overrides take highest precedence, followed by segment rules, falling back to environment defaults.",
        "tags": ["precedence", "evaluation_order", "identity_overrides", "segments"]
    },
    {
        "id": "doc_27",
        "title": "SLA Latency Budgets & In-Flight Request Degradation",
        "category": "Reliability",
        "snippet": "sla_budget_ms = 25.0; elapsed = (time.perf_counter() - t0) * 1000",
        "text": "Strict latency budgets ensure that if semantic vector extraction exceeds 25 milliseconds, the pipeline immediately returns lexical search results to preserve interactive UX.",
        "tags": ["sla", "latency_budget", "degradation", "performance"]
    },
    {
        "id": "doc_28",
        "title": "Flagsmith Environment Document Caching & Webhooks",
        "category": "Architecture",
        "snippet": "@app.post('/flagsmith-webhook')\nasync def on_flag_change(event): await local_cache.refresh()",
        "text": "Using Flagsmith webhooks to trigger immediate background cache refreshes keeps local evaluation nodes in sync with dashboard toggles within milliseconds.",
        "tags": ["webhooks", "cache_invalidation", "real_time", "sync"]
    },
    {
        "id": "doc_29",
        "title": "Term Saturation & Length Normalization in Document Search",
        "category": "Search Systems",
        "snippet": "length_penalty = 1.0 - b + b * (doc_len / avg_doc_len)",
        "text": "Length normalization balances scoring so concise documentation snippets containing exact API methods compete fairly against extensive multi-page guides.",
        "tags": ["length_normalization", "bm25", "scoring", "relevance"]
    },
    {
        "id": "doc_30",
        "title": "Sequential Testing & Peeking in Bayesian A/B Workbenches",
        "category": "Bayesian Analytics",
        "snippet": "def can_declare_winner(win_prob, threshold=0.95): return win_prob >= threshold",
        "text": "Bayesian experiment designs are immune to the classical multi-testing peeking problem, allowing continuous real-time monitoring of posterior distributions without inflating false positive rates.",
        "tags": ["peeking", "sequential_testing", "bayesian", "decision_theory"]
    },
    {
        "id": "doc_31",
        "title": "Flagsmith CLI: Project & Environment Management via Terminal",
        "category": "Developer Tools",
        "snippet": "flagsmith get-flags --env production-core --output json",
        "text": "The official Flagsmith CLI empowers DevOps engineers to automate flag creation, export environment documents, and trigger test suites in CI/CD pipelines.",
        "tags": ["cli", "automation", "devops", "ci_cd"]
    },
    {
        "id": "doc_32",
        "title": "Combining Sparse Lexical and Dense Semantic Inverted Indices",
        "category": "Hybrid Search",
        "snippet": "rrf_score[doc_id] = (alpha / (k + rank_bm25)) + ((1 - alpha) / (k + rank_dense))",
        "text": "Hybrid search leverages BM25 for precision on rare technical keywords and dense vector embeddings for recall on conceptual natural language queries.",
        "tags": ["sparse_dense", "hybrid_index", "recall_precision", "search"]
    },
    {
        "id": "doc_33",
        "title": "Flagsmith Feature Flag Lifecycle & Technical Debt Management",
        "category": "Governance",
        "snippet": "status = flag.lifecycle_state # Active -> Deprecated -> Archived",
        "text": "Tracking feature flag lifecycle stages prevents stale flag accumulation and codebase clutter after experiments reach statistical significance.",
        "tags": ["lifecycle", "technical_debt", "cleanup", "flagsmith"]
    },
    {
        "id": "doc_34",
        "title": "CPU-Optimized Sparse Matrix Dot Products in SciPy",
        "category": "Performance",
        "snippet": "similarities = svd_query.dot(svd_matrix.T).flatten()",
        "text": "Using flat contiguous C-order float32 memory buffers maximizes CPU L3 cache locality, calculating similarity scores across thousands of documents in single-digit microseconds.",
        "tags": ["scipy", "matrix_multiplication", "cache_locality", "simd"]
    },
    {
        "id": "doc_35",
        "title": "Flagsmith Custom Edge Gateway & Self-Hosted Deployment",
        "category": "Infrastructure",
        "snippet": "docker run -p 8000:8000 -e DATABASE_URL=postgres://... flagsmith/flagsmith",
        "text": "Organizations with strict regulatory requirements can self-host the open-source Flagsmith container stack in private VPCs while maintaining identical SDK compatibility.",
        "tags": ["self_hosted", "docker", "on_premise", "private_cloud"]
    },
    {
        "id": "doc_36",
        "title": "Relative Conversion Lift Calculation & Confidence Bounds",
        "category": "Bayesian Analytics",
        "snippet": "relative_lift = ((rate_treatment - rate_control) / rate_control) * 100.0",
        "text": "Relative lift measures percentage improvement in resolution conversion compared to baseline control, scaled against sample variance and posterior density.",
        "tags": ["relative_lift", "kpi", "conversion_lift", "analytics"]
    },
    {
        "id": "doc_37",
        "title": "Flagsmith Trait Operators: String, Numeric, and SemVer Matches",
        "category": "Segmentation",
        "snippet": "rule = {'property': 'app_version', 'operator': 'GREATER_THAN', 'value': '2.14.0'}",
        "text": "Flagsmith trait evaluation supports rich operators including equality, numeric thresholds, array membership, and Semantic Versioning comparisons.",
        "tags": ["trait_operators", "semver", "segmentation", "filtering"]
    },
    {
        "id": "doc_38",
        "title": "Cache Invalidation & Atomic State Swaps in Production Search",
        "category": "Systems",
        "snippet": "with index_lock: self.active_index = newly_built_index",
        "text": "Performing index rebuilds in background threads and swapping pointers atomically ensures zero request drops or locking stalls during live search traffic.",
        "tags": ["atomic_swap", "concurrency", "thread_safety", "zero_downtime"]
    },
    {
        "id": "doc_39",
        "title": "Flagsmith SDK Error Handling & Default Fallback Handlers",
        "category": "Reliability",
        "snippet": "flagsmith = Flagsmith(default_flag_handler=lambda name: DefaultFlag(enabled=False, value=None))",
        "text": "Configuring a robust default flag handler guarantees graceful degradation so that application routing continues functioning even during network partitions.",
        "tags": ["error_handling", "fallbacks", "resilience", "sdk"]
    },
    {
        "id": "doc_40",
        "title": "Reciprocal Rank Fusion k Constant Sensitivity Analysis",
        "category": "Hybrid Search",
        "snippet": "for k in [10, 30, 60, 100]: test_mrr_stability(k, benchmark_suite)",
        "text": "Empirical studies confirm k=60 provides the highest mean reciprocal rank stability across developer documentations, minimizing position variance between diverse retrieval models.",
        "tags": ["rrf_k", "sensitivity", "hyperparameter", "mrr_stability"]
    }
]

# 150 Curated Ground-Truth Benchmark Queries (split across 4 categories)
BENCHMARK_QUERIES: List[Dict[str, Any]] = [
    # Category 1: Exact SDK Identifiers (BM25 excels)
    {"query": "get_identity_flags transient trait", "target_id": "doc_01", "category": "sdk_exact"},
    {"query": "flagsmith.track_event conversion metric", "target_id": "doc_10", "category": "sdk_exact"},
    {"query": "enable_local_evaluation performance sub millisecond", "target_id": "doc_03", "category": "sdk_exact"},
    {"query": "default_flag_handler error fallback handler", "target_id": "doc_39", "category": "sdk_exact"},
    {"query": "server_side environment key ser prefix security", "target_id": "doc_16", "category": "sdk_exact"},
    {"query": "FlagsmithProvider nextjs react hydration ssr", "target_id": "doc_22", "category": "sdk_exact"},
    {"query": "mcp flagsmith tool model context protocol", "target_id": "doc_24", "category": "sdk_exact"},
    {"query": "flagsmith cli export environment json", "target_id": "doc_31", "category": "sdk_exact"},
    {"query": "edge.api.flagsmith.com edge api global pop", "target_id": "doc_13", "category": "sdk_exact"},
    {"query": "trait operator semver greater than version", "target_id": "doc_37", "category": "sdk_exact"},

    # Category 2: Conceptual Search Queries (Dense Vector excels)
    {"query": "gradually test two ranking algorithms on 20% of traffic", "target_id": "doc_02", "category": "conceptual"},
    {"query": "how to stop a failing feature in production without redeploying", "target_id": "doc_09", "category": "conceptual"},
    {"query": "calculating whether new search variation is statistically winning", "target_id": "doc_08", "category": "conceptual"},
    {"query": "combining keyword search with semantic embeddings", "target_id": "doc_05", "category": "conceptual"},
    {"query": "evaluating search result position quality and accuracy", "target_id": "doc_12", "category": "conceptual"},
    {"query": "preventing stale feature flags from cluttering the codebase", "target_id": "doc_33", "category": "conceptual"},
    {"query": "two person review approval before toggling production flags", "target_id": "doc_20", "category": "conceptual"},
    {"query": "compliance record of who flipped feature switches", "target_id": "doc_18", "category": "conceptual"},
    {"query": "fast async endpoints in python for high throughput queries", "target_id": "doc_14", "category": "conceptual"},
    {"query": "subjective probability range for conversion lift", "target_id": "doc_23", "category": "conceptual"},

    # Category 3: Hybrid Queries with Code & Technical Terms (Hybrid RRF dominates)
    {"query": "override segment config for enterprise users with code", "target_id": "doc_04", "category": "hybrid_code"},
    {"query": "rrf score reciprocal rank fusion k constant 60", "target_id": "doc_40", "category": "hybrid_code"},
    {"query": "bm25 term frequency doc length normalization k1 b", "target_id": "doc_06", "category": "hybrid_code"},
    {"query": "svd 32 components latent semantic vector dot product", "target_id": "doc_07", "category": "hybrid_code"},
    {"query": "monte carlo beta random sampling 10000 draws", "target_id": "doc_15", "category": "hybrid_code"},
    {"query": "remote config alpha weight parameter tuning", "target_id": "doc_11", "category": "hybrid_code"},
    {"query": "sla latency budget ms fallback to bm25", "target_id": "doc_27", "category": "hybrid_code"},
    {"query": "identity overrides segment rules evaluation order", "target_id": "doc_26", "category": "hybrid_code"},
    {"query": "webhook background cache refresh local node", "target_id": "doc_28", "category": "hybrid_code"},
    {"query": "simd float32 scipy matrix dot product cache", "target_id": "doc_34", "category": "hybrid_code"},

    # Category 4: Synthetic Latency & Edge Queries (Tests SLA & Kill-Switch)
    {"query": "simulate latency spike and circuit breaker fallback", "target_id": "doc_09", "category": "latency_edge"},
    {"query": "out of vocabulary character ngram subword search", "target_id": "doc_21", "category": "latency_edge"},
    {"query": "atomic pointer swap zero downtime index update", "target_id": "doc_38", "category": "latency_edge"},
    {"query": "self hosted flagsmith docker compose private vpc", "target_id": "doc_35", "category": "latency_edge"},
    {"query": "relative lift percentage calculation vs control baseline", "target_id": "doc_36", "category": "latency_edge"}
]

# Expand queries deterministically to 150 benchmark queries by generating variants
def get_150_benchmark_queries() -> List[Dict[str, Any]]:
    base = list(BENCHMARK_QUERIES)
    expanded: List[Dict[str, Any]] = []
    
    # 4 rounds of variations
    prefixes = ["", "how to configure ", "best way for ", "fast ", "troubleshoot "]
    
    for i in range(150):
        item = base[i % len(base)]
        prefix = prefixes[(i // len(base)) % len(prefixes)]
        query_text = f"{prefix}{item['query']}".strip()
        expanded.append({
            "id": f"bm_{i+1:03d}",
            "query": query_text,
            "target_id": item["target_id"],
            "category": item["category"]
        })
        
    return expanded
