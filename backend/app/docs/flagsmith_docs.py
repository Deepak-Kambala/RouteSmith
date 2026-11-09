"""Technical documentation corpus for Flagsmith and FastAPI integration."""

FLAGS_DOCS = [
    {
        "id": "doc_fs_01",
        "title": "Flagsmith Python SDK Initialization & Async Patterns",
        "category": "SDK Setup",
        "content": (
            "To initialize the Flagsmith Python SDK in FastAPI, create a singleton Flagsmith instance with your "
            "server-side environment key: `flagsmith = Flagsmith(environment_key='ser.YOUR_KEY', enable_analytics=True)`. "
            "For high-throughput async endpoints, evaluate flags per identity using "
            "`identity_flags = flagsmith.get_identity_flags(identifier=user_id, traits={'user_tier': tier})`. "
            "Avoid re-instantiating the Flagsmith client on every request to prevent connection pool exhaustion."
        )
    },
    {
        "id": "doc_fs_02",
        "title": "Multivariate Feature Flag Routing in RAG Gateways",
        "category": "Multivariate Flags",
        "content": (
            "Multivariate flags allow splitting traffic across multiple string or JSON variants. "
            "To retrieve the assigned variant: `strategy = identity_flags.get_feature_value('rag_pipeline_strategy')`. "
            "Flagsmith computes a deterministic MD5/SHA256 percentage hash on the `identifier`, guaranteeing that "
            "a user consistently receives the same RAG pipeline variant across repeated requests unless traffic weights "
            "are reconfigured via the Flagsmith Admin API."
        )
    },
    {
        "id": "doc_fs_03",
        "title": "Tracking Custom Conversion Events with Flagsmith Analytics",
        "category": "Event Analytics",
        "content": (
            "Flagsmith's event ingestion pipeline records user exposures and conversions for Bayesian A/B analysis. "
            "To log a resolution metric: `flagsmith.track_event(identifier=user_id, event_name='answer_resolved')`. "
            "Negative guardrails should be enforced client-side or router-side: if a developer submits an error follow-up "
            "within 30 seconds, cancel or discard the conversion event before it commits to the managed warehouse."
        )
    },
    {
        "id": "doc_fs_04",
        "title": "Dynamic Guardrail Remote Config: Tokens and Semantic Cache",
        "category": "Remote Config",
        "content": (
            "Remote config parameters enable dynamic tuning without deployment. For instance, `max_context_tokens` "
            "can be retrieved via `tokens = identity_flags.get_feature_value('max_context_tokens') or 2048`. "
            "Similarly, the boolean flag `enable_semantic_cache` controls in-memory or Redis vector caching: "
            "`is_cache_enabled = identity_flags.is_feature_enabled('enable_semantic_cache')`."
        )
    },
    {
        "id": "doc_fs_05",
        "title": "Automated Winner Rollout via Flagsmith Admin API",
        "category": "Admin API",
        "content": (
            "Once Bayesian convergence is established (e.g., Win Probability > 95%), call the Flagsmith Admin API: "
            "PUT /api/v1/environments/{env_key}/feature-states/{feature_id}/ with multivariate options updated to "
            "Variant A: 0%, Variant B: 100%, Variant C: 0%. This propagates to edge SDKs within seconds without code changes."
        )
    }
]

