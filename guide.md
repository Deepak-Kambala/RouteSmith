# RouteSmith AI - User Guide & Operator Manual

This guide covers everything needed to operate, test, and customize RouteSmith AI, including how to ingest custom data, run 1,500-developer synthetic traffic simulations, and evaluate Bayesian A/B test results without external API keys.

---

## 1. Quick Start

RouteSmith AI operates out of the box with zero external dependencies.

### Starting the Servers

Start the FastAPI backend:
```bash
cd backend
/opt/anaconda3/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the Next.js frontend:
```bash
cd frontend
npx next start -p 3000
```

Access the interfaces:
* Web Application: http://localhost:3000
* Backend Interactive Swagger API: http://localhost:8000/docs

---

## 2. Ingesting & Testing Custom Data

RouteSmith AI features a dynamic knowledge base that routes all RAG pipelines (Fast Zero-Shot, Clustered Hybrid, and Agentic Self-Reflection) over your custom documentation.

### Method A: Via the Web UI (Recommended)
1. Navigate to http://localhost:3000.
2. Click the `02//CUSTOM DATA` tab in the header.
3. Fill in:
   * Document Title: e.g. `My Custom Auth Service`
   * Category: e.g. `Security`
   * Content: Paste your API docs, code snippets, or markdown.
4. Click `[INGEST DOCUMENT]`.
5. Switch back to `01//COPILOT` and ask a question about your custom doc. All 3 variants will retrieve from your ingested context.
6. To restore default documentation, click `[RESET]` in the Custom Data tab.

### Method B: Via Terminal / cURL
Send documents programmatically to the backend:
```bash
curl -X POST http://localhost:8000/api/docs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "PostgreSQL Connection Pooling",
    "category": "Database",
    "content": "Configure async connection pools with create_async_engine(DATABASE_URL, pool_size=20, max_overflow=10). Yield async_session() inside FastAPI dependency."
  }'
```

To list all indexed chunks:
```bash
curl -s http://localhost:8000/api/docs
```

To reset the database:
```bash
curl -X POST http://localhost:8000/api/docs/reset
```

### Method C: Via Direct File Edit
You can inspect or edit the persistent JSON corpus directly at:
* `backend/app/docs/custom_docs.json`
* `backend/app/docs/flagsmith_docs.py` (Default fallback corpus)

---

## 3. The 5 Navigation Tabs Explained

### Tab 01: Copilot & Sandbox
* Ask queries about active documentation.
* View assigned RAG variant (`Variant A`, `Variant B`, or `Variant C`), execution latency (ms), and estimated token cost ($).
* `[COPY CODE]`: Copies the code snippet and logs an `answer_resolved` conversion event.
* `[SANDBOX RUN]`: Tests code execution in an isolated terminal runner and dispatches an `answer_resolved` event.
* `[MARK RESOLVED]`: Explicitly marks the answer as verified.
* Negative Guardrail: A 30-second timer active on each query. If an error follow-up is submitted within 30 seconds, the conversion is suppressed.

### Tab 02: Custom Data
* Ingest custom documentation chunks into the vector and BM25 store.
* Quick preset buttons for instant testing (`[Payments API]`, `[Database]`).
* Displays active indexed chunks count and previews.

### Tab 03: 1,500 Swarm Simulator
* Solves the hackathon problem of sample starvation by generating 1,500 statistically significant developer sessions live.
* Use the slider to set volume between 100 and 2,000 identities.
* Click `[RUN SWARM]` to watch the 500-dot hardware matrix light up with identity traffic across Variant A (amber), Variant B (emerald), and Variant C (purple).
* Ingests 263 conversions (Variant A: 11.2%, Variant B: 24.8%, Variant C: 16.5%).

### Tab 04: Bayesian Telemetry
* Visualizes continuous Beta posterior probability density functions:
  Beta(alpha + conversions, beta + exposures - conversions)
* Displays win probabilities computed via 50,000 Monte Carlo draws:
  Variant B Win Probability: 97.4% (+121.4% relative lift over baseline).
* `[PROMOTE WINNER (VAR B)]`: Updates traffic weights from 33/33/34 to 0/100/0 via the Flagsmith Admin API with zero downtime.

### Tab 05: Lifecycle Visualizer
* Step-by-step interactive diagram corresponding to the 4 stages of the Flagsmith experimentation lifecycle:
  1. Multivariate Flag Setup (`rag_pipeline_strategy`)
  2. Conversion Metric Instrumentation (`answer_resolved`)
  3. Traffic Split & Ingestion (1,500 identities)
  4. Bayesian Rollout (0/100/0 promotion)
* Click any node to inspect raw Flagsmith SDK request and response JSON payloads.

---

## 4. Identity Testing & Deterministic Routing

Flagsmith deterministically hashes each user identity:
* `MD5(user_id) % 100 < 33` -> Variant A (`fast_zero_shot`)
* `MD5(user_id) % 100 < 66` -> Variant B (`clustered_hybrid_rag`)
* `MD5(user_id) % 100 >= 66` -> Variant C (`agentic_self_reflection`)

To test different variants live in the UI:
* Click the `[REROLL]` button in the header.
* A fresh identity UUID will be assigned (`flagsmith.identify()`), and the assigned variant badge will automatically update according to the traffic split.

---

## 5. Optional External API Keys

External API keys are completely optional.

If you wish to test with live cloud providers:
1. Open `.env` and `backend/.env`.
2. Add your keys:
   ```env
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key

   # Flagsmith Cloud (Server-side key)
   FLAGSMITH_ENVIRONMENT_KEY=ser.your_flagsmith_key
   FLAGSMITH_ADMIN_API_KEY=your_admin_key
   ```
3. Restart the backend. The system will detect live keys and route requests through live cloud endpoints, falling back to local deterministic execution if offline.

---

## 6. Architecture & Tech Stack

* Frontend: Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons.
* Backend: FastAPI (Python 3.11+), Pydantic v2, Uvicorn.
* Feature Flags: Flagsmith Python SDK v6.5 (Local deterministic hash fallback).
* Inference Math: Beta-Binomial conjugate update, Monte Carlo MCMC win probability sampling.
* Styling: Neo-tactile pixel craft inspired by Teenage Engineering and developer control decks.
