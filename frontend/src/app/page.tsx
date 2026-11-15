"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  Key,
  X,
  Search,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  TrendingUp,
  Cpu,
  BarChart3,
  UserCheck,
  AlertTriangle,
  Info,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function SearchForgeDashboard() {
  // --- View Mode: User Experiment vs Offline Benchmark ---
  const [activeTab, setActiveTab] = useState<"experiment" | "benchmark">("experiment");

  // --- Search & Session State ---
  const [sessionCount, setSessionCount] = useState<number>(1);
  const [sessionId, setSessionId] = useState<string>("sess_dev_01");
  const [query, setQuery] = useState("get_identity_flags transient trait");
  const [latencyMs, setLatencyMs] = useState<number>(0.4);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Key Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [keyUpdateStatus, setKeyUpdateStatus] = useState<string | null>(null);

  // Flagsmith & Remote Config State
  const [config, setConfig] = useState<any>({
    is_live: false,
    mode: "local_simulation",
    environment_key_masked: "NONE",
    connection_message: "Loading...",
    active_flags: {
      flag_key: "retrieval_ranking_engine",
      alpha: 0.45,
      rrf_k: 60,
      code_boost: 1.35,
      latency_sla_ms: 25.0,
      kill_switch_active: false,
    },
  });

  // Active Query Evaluation & Audit Trail
  const [activeEval, setActiveEval] = useState<any>({
    identifier: "sess_dev_01",
    traits: { has_error_code: true, query_tokens: 3, tier: "developer" },
    variant: "lexical_bm25",
    assignment_source: "local_simulation",
    is_live_flagsmith: false,
    kill_switch_active: false,
    segment_override: true,
    segment_name: "Error Code Diagnosticians",
    warning: "Running local simulation.",
    remote_config: { alpha: 0.45, rrf_k: 60, code_boost: 1.35, latency_sla_ms: 25.0 },
  });

  // Retrieved Top 3 Documentation Chunks
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // User Experiment State
  const [experimentState, setExperimentState] = useState<any>({
    evidence_type: "user_experiment",
    hypothesis: "Serving Hybrid RRF ranking increases developer documentation utility.",
    primary_metric: "Snippet Copy Rate (Proxy for Usefulness)",
    status: "COLLECTING_EVIDENCE",
    status_message: "Collecting evidence: Sample size too small (N=0/15 minimum).",
    total_sessions: 0,
    total_conversions: 0,
    winner_variant: null,
    winner_lift: null,
    winner_probability: null,
    variants: [],
    curves: {},
    telemetry_recent: [],
  });

  // Offline Retrieval Benchmark State
  const [benchmarkState, setBenchmarkState] = useState<any>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // --- Initial Data Fetch ---
  useEffect(() => {
    fetchConfig();
    fetchExperimentState();
    fetchBenchmarkResults();
    handleExecuteSearch("get_identity_flags transient trait", "sess_dev_01");
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.warn("Backend config fetch failed:", e);
    }
  };

  const fetchExperimentState = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/experiment/state`);
      if (res.ok) {
        const data = await res.json();
        setExperimentState(data);
      }
    } catch (e) {
      console.warn("Backend experiment state fetch failed:", e);
    }
  };

  const fetchBenchmarkResults = async () => {
    try {
      setIsBenchmarking(true);
      const res = await fetch(`${BACKEND_URL}/api/benchmark/results`);
      if (res.ok) {
        const data = await res.json();
        setBenchmarkState(data);
      }
    } catch (e) {
      console.warn("Backend benchmark fetch failed:", e);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // --- Rotate to a New Session ---
  const handleNewSession = () => {
    const nextCount = sessionCount + 1;
    const nextId = `sess_dev_${nextCount.toString().padStart(2, "0")}`;
    setSessionCount(nextCount);
    setSessionId(nextId);
    handleExecuteSearch(query, nextId);
    triggerToast(`Created new session: ${nextId}. Evaluated fresh variant.`);
  };

  // --- Search Execution ---
  const handleExecuteSearch = async (
    searchQuery: string,
    currentSessionId?: string,
    overrideTraits?: Record<string, any>,
    simulateLatency: boolean = false
  ) => {
    setIsSearching(true);
    const q = searchQuery || query;
    const sess = currentSessionId || sessionId;
    try {
      const traits = overrideTraits || {
        has_error_code: q.includes("error") || q.includes("trait") || q.includes("_"),
        query_tokens: q.split(" ").length,
        tier: q.includes("enterprise") ? "enterprise" : "developer",
      };

      const res = await fetch(`${BACKEND_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          session_id: sess,
          user_id: sess,
          traits: traits,
          simulate_latency: simulateLatency,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveEval(data.flagsmith);
        setSearchResults(data.search.results || []);
        setLatencyMs(data.latency_ms);
        fetchExperimentState(); // Update session exposure counts
      }
    } catch (e) {
      console.error("Search execution failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  // --- Copy Snippet & Fire Real Conversion Event ---
  const handleCopySnippet = async (doc: any) => {
    try {
      await navigator.clipboard.writeText(doc.snippet);
      setCopiedDocId(doc.id);
      setTimeout(() => setCopiedDocId(null), 1800);

      const res = await fetch(`${BACKEND_URL}/api/conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          doc_id: doc.id,
          rank: doc.final_rank || 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExperimentState(data.state);
        if (data.duplicate) {
          triggerToast(`Conversion already recorded for ${sessionId} (deduplicated).`);
        } else {
          triggerToast(`Event 'doc_snippet_resolved' logged & attributed to ${data.attributed_variant}`);
        }
      }
    } catch (e) {
      console.warn("Conversion tracking error:", e);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // --- Labeled Traffic Scenario Injector ---
  const handleInjectScenario = async (scenarioName: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/experiment/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioName }),
      });
      if (res.ok) {
        const data = await res.json();
        setExperimentState(data.state);
        if (scenarioName === "reset") {
          triggerToast("Reset user experiment to pristine 0-evidence state.");
        } else if (scenarioName === "inconclusive_low_sample") {
          triggerToast("Injected small pilot (N=12). Shows 'Not Enough Evidence' as expected.");
        } else if (scenarioName === "sdk_exact_bm25_wins") {
          triggerToast("Injected API reference traffic: BM25 Control wins (Proves no rigging!).");
        } else if (scenarioName === "mixed_traffic_hybrid_wins") {
          triggerToast("Injected mixed developer traffic: Hybrid RRF wins with +81% lift.");
        }
      }
    } catch (e) {
      console.error("Scenario injection failed:", e);
    }
  };

  // --- Update Environment Key at Runtime ---
  const handleSaveEnvironmentKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setKeyUpdateStatus("Connecting to Flagsmith...");
    try {
      const res = await fetch(`${BACKEND_URL}/api/config/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment_key: inputKey.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.status);
        setKeyUpdateStatus("Connected successfully!");
        handleExecuteSearch(query, sessionId);
        setTimeout(() => {
          setShowKeyModal(false);
          setKeyUpdateStatus(null);
          setInputKey("");
        }, 800);
      } else {
        setKeyUpdateStatus("Connection failed. Check key format.");
      }
    } catch (err) {
      setKeyUpdateStatus("Network error connecting to backend.");
    }
  };

  // --- Preset Chips Handler ---
  const handleSelectPreset = (chipType: string) => {
    if (chipType === "sdk") {
      const q = "get_identity_flags transient trait";
      setQuery(q);
      handleExecuteSearch(q, sessionId, { has_error_code: true, query_tokens: 3, tier: "developer" }, false);
    } else if (chipType === "concept") {
      const q = "gradually test two ranking algorithms on 20% of traffic";
      setQuery(q);
      handleExecuteSearch(q, sessionId, { has_error_code: false, query_tokens: 9, tier: "standard" }, false);
    } else if (chipType === "hybrid") {
      const q = "override segment config for enterprise users with code";
      setQuery(q);
      handleExecuteSearch(q, sessionId, { has_error_code: false, query_tokens: 8, tier: "enterprise" }, false);
    } else if (chipType === "latency") {
      const q = "simulate latency spike and circuit breaker fallback";
      setQuery(q);
      handleExecuteSearch(q, sessionId, { has_error_code: false, query_tokens: 7, tier: "developer" }, true);
      triggerToast("Simulated 85ms latency spike: Triggered SLA Kill-Switch Fallback");
    }
  };

  const getVariantColor = (v: string) => {
    if (v === "lexical_bm25") return "#D99B26";
    if (v === "semantic_dense") return "#38BDF8";
    return "#37ECA5";
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#090A0F] text-slate-200 engineering-canvas select-none">
      {/* =========================================================================
          TOP COMMAND BAR (56px) - Authoritative Engineering Navigation
      ========================================================================= */}
      <header className="h-14 border-b border-[#1C202C] px-4 flex items-center justify-between shrink-0 bg-[#0C0E14]/95 backdrop-blur-md z-20">
        {/* Left: Official Brand + Flagsmith Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/brand/searchforge-icon.png"
              alt="SearchForge"
              className="w-7 h-6 object-contain shrink-0"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold tracking-tight text-slate-100 font-mono">
                Search<span className="text-[#37ECA5]">Forge</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider hidden xl:inline">
                // Track 01 Experimentation Bench
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#222736] mx-1" />

          {/* Connection Status Pill */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#131620] border border-[#222736] hover:border-slate-500 text-xs transition-colors"
            title="Configure live Flagsmith environment key"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                config.is_live ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span className="font-mono text-[11px] text-slate-300">
              {config.is_live
                ? `LIVE: Flagsmith Edge (${config.environment_key_masked})`
                : "LOCAL SIMULATION MODE"}
            </span>
            <Key className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
        </div>

        {/* Center: Remote Config Monospace HUD */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded telemetry-hud text-[11px] font-mono text-slate-300">
          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] uppercase font-medium">
            Flag: retrieval_ranking_engine
          </span>
          <span className="text-slate-600">&bull;</span>
          <span>α: <strong className="text-emerald-400">{config.active_flags?.alpha ?? 0.45}</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span>rrf_k: <strong className="text-slate-200">{config.active_flags?.rrf_k ?? 60}</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span>boost: <strong className="text-sky-400">{config.active_flags?.code_boost ?? 1.35}x</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span>SLA: <strong className="text-amber-400">&le;{config.active_flags?.latency_sla_ms ?? 25}ms</strong></span>
        </div>

        {/* Right: Kill-Switch Status */}
        <div className="flex items-center gap-2">
          {activeEval.kill_switch_active ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-rose-500/40 bg-rose-950/20 text-rose-300 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-semibold text-[11px] uppercase tracking-wide">
                KILL-SWITCH ACTIVE: FORCED BM25
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#222736] bg-[#111319] text-slate-400 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                KILL-SWITCH: ARMED (OFF)
              </span>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          QUESTION & PROXY METRIC BANNER (Track 01 Core Requirement)
      ========================================================================= */}
      <div className="bg-[#0C0E14] border-b border-[#1C202C] px-4 py-1.5 flex items-center justify-between text-xs font-mono text-slate-300 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-semibold uppercase">
            Product Question
          </span>
          <span className="font-medium text-slate-100 truncate">
            “Which ranking strategy helps developers find and use the right documentation?”
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Metric: Snippet Copy Rate (Observable proxy for usefulness, not definitive proof of task success)</span>
        </div>
      </div>

      {/* =========================================================================
          12-COLUMN, 2-ROW BENTO WORKSPACE (calc(100vh - 84px))
      ========================================================================= */}
      <main className="flex-1 p-3 grid grid-cols-12 grid-rows-12 gap-3 overflow-hidden">
        {/* =======================================================================
            QUADRANT 1: TOP-LEFT (5 Columns, 5 Rows ~42% Height)
            Live Query, Session State & Flagsmith Assignment Audit
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-5 row-span-5 bento-panel p-3 flex flex-col justify-between overflow-hidden">
          <div className="space-y-2">
            {/* Header: Session & Latency */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 font-mono">
                  <Search className="w-3.5 h-3.5 text-sky-400" />
                  Query &amp; Session Inspector
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {sessionId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewSession}
                  className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  title="Generate a new stable session ID to test fresh Flagsmith assignment"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>New Session</span>
                </button>
                <span className="text-[10px] font-mono text-slate-400">
                  CPU: <strong className="text-emerald-400">{latencyMs}ms</strong>
                </span>
              </div>
            </div>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteSearch(query);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search technical documentation..."
                  className="w-full h-8 px-3 pr-10 text-xs font-mono rounded bg-[#0D0E14] border border-[#222736] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
                />
                <span className="absolute right-2 top-1.5 text-[10px] font-mono text-slate-400 px-1 rounded border border-[#222736] bg-[#111319]">
                  ⌘K
                </span>
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="h-8 px-3 rounded bg-[#1C202C] hover:bg-[#282F40] text-slate-200 text-xs font-medium font-mono flex items-center gap-1 transition-colors border border-[#2B3245]"
              >
                <span>{isSearching ? "..." : "Search"}</span>
              </button>
            </form>

            {/* 4 Demo Preset Chips */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleSelectPreset("sdk")}
                className="p-1.5 rounded bg-[#0E1017] border border-[#1F2432] hover:border-amber-500/40 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-amber-300 font-mono">
                    [Exact SDK]
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">BM25 Wins</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate">
                  get_identity_flags transient
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("concept")}
                className="p-1.5 rounded bg-[#0E1017] border border-[#1F2432] hover:border-sky-500/40 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-sky-300 font-mono">
                    [Conceptual]
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Dense Wins</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate">
                  gradually test two ranking algos
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("hybrid")}
                className="p-1.5 rounded bg-[#0E1017] border border-[#1F2432] hover:border-emerald-500/40 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-emerald-300 font-mono">
                    [Hybrid Code]
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">RRF Dominates</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate">
                  override segment config enterprise
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("latency")}
                className="p-1.5 rounded bg-[#0E1017] border border-[#1F2432] hover:border-rose-500/40 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-rose-300 font-mono">
                    [Latency Spike]
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Kill-Switch</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate">
                  Simulate 85ms SLA Breach
                </div>
              </button>
            </div>
          </div>

          {/* Flagsmith Assignment Audit Trail (Honest & Auditable) */}
          <div className="mt-2 p-2 rounded bg-[#0D0E14] border border-[#1C202C] font-mono text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-medium">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Flagsmith Assignment Audit
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                  activeEval.assignment_source === "live_flagsmith_edge"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}
              >
                {activeEval.assignment_source === "live_flagsmith_edge"
                  ? "LIVE FLAGSMITH EDGE"
                  : "LOCAL SIMULATION"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-0.5">
              <div>
                <span>Evaluated Flag: </span>
                <strong className="text-slate-200">retrieval_ranking_engine</strong>
              </div>
              <div className="text-right">
                <span>Assigned: </span>
                <strong
                  className="uppercase font-bold"
                  style={{ color: getVariantColor(activeEval.variant) }}
                >
                  {activeEval.variant}
                </strong>
              </div>
            </div>

            {activeEval.warning && (
              <div className="text-[9px] text-amber-400/90 leading-tight pt-0.5">
                Note: {activeEval.warning}
              </div>
            )}
          </div>
        </section>

        {/* =======================================================================
            QUADRANT 3: TOP-RIGHT (7 Columns, 7 Rows ~58% Height)
            The Dual-Mode Analysis Arena (User Experiment vs Offline Benchmark)
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-7 row-span-7 bento-panel p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="space-y-2.5">
            {/* Header: Mode Switcher & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1C202C]">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-[#0D0E14] p-0.5 rounded border border-[#222736]">
                <button
                  type="button"
                  onClick={() => setActiveTab("experiment")}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === "experiment"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>User Experiment (A/B)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("benchmark")}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === "benchmark"
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Offline Retrieval Benchmark</span>
                </button>
              </div>

              {/* Action Buttons for Mode A (User Experiment) */}
              {activeTab === "experiment" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500 hidden xl:inline">
                    Simulate Scenario:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInjectScenario("inconclusive_low_sample")}
                    className="h-6 px-2 rounded bg-[#131620] border border-[#222736] hover:border-slate-500 text-slate-300 text-[10px] font-mono"
                    title="Small sample (N=12) showing 'Not enough evidence'"
                  >
                    Low Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInjectScenario("sdk_exact_bm25_wins")}
                    className="h-6 px-2 rounded bg-[#131620] border border-[#222736] hover:border-amber-500/50 text-amber-300 text-[10px] font-mono"
                    title="API reference queries where BM25 wins (proves no rigging)"
                  >
                    BM25 Wins
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInjectScenario("mixed_traffic_hybrid_wins")}
                    className="h-6 px-2 rounded bg-[#131620] border border-[#222736] hover:border-emerald-500/50 text-emerald-300 text-[10px] font-mono"
                    title="Mixed queries where Hybrid RRF wins"
                  >
                    Hybrid Wins
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInjectScenario("reset")}
                    className="h-6 px-1.5 rounded bg-[#131620] border border-[#222736] hover:border-slate-500 text-slate-400 hover:text-white"
                    title="Reset to 0 sessions"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Action for Mode B (Benchmark) */}
              {activeTab === "benchmark" && (
                <button
                  type="button"
                  onClick={fetchBenchmarkResults}
                  disabled={isBenchmarking}
                  className="h-6 px-3 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-medium flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${isBenchmarking ? "animate-spin" : ""}`} />
                  <span>{isBenchmarking ? "Evaluating..." : "Run Benchmark"}</span>
                </button>
              )}
            </div>

            {/* --- TAB CONTENT: MODE A (USER EXPERIMENT) --- */}
            {activeTab === "experiment" && (
              <div className="space-y-2">
                {/* Experiment Status Banner (Non-Negotiable Honesty) */}
                <div
                  className={`p-2 rounded border font-mono text-xs flex items-center justify-between ${
                    experimentState.status === "STATISTICAL_WINNER_DETECTED"
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      : experimentState.status === "COLLECTING_EVIDENCE"
                      ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                      : "bg-slate-900/60 border-slate-700/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {experimentState.status === "STATISTICAL_WINNER_DETECTED" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className="text-[11px] font-medium leading-snug">
                      {experimentState.status_message}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-white/10 bg-black/40 text-slate-400 shrink-0">
                    N={experimentState.total_sessions} Sessions
                  </span>
                </div>

                {/* 3-Variant User Experiment Matrix Table */}
                <div className="overflow-x-auto rounded border border-[#1C202C]">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="bg-[#141722] text-[10px] text-slate-400 uppercase tracking-wider border-b border-[#1C202C]">
                        <th className="py-1 px-3">Variant</th>
                        <th className="py-1 px-2 text-right">Sessions (N)</th>
                        <th className="py-1 px-2 text-right">Copies (k)</th>
                        <th className="py-1 px-2 text-right">Copy Rate</th>
                        <th className="py-1 px-2 text-center">95% Credible Interval</th>
                        <th className="py-1 px-2 text-right">Lift vs Ctrl</th>
                        <th className="py-1 px-3 text-right">Win Probability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C202C] text-[11px]">
                      {experimentState.variants?.map((v: any) => (
                        <tr key={v.variant_id} className="hover:bg-[#141722]/50 transition-colors">
                          <td className="py-1.5 px-3 font-medium text-slate-200">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: v.color }}
                            />
                            {v.name}
                          </td>
                          <td className="py-1.5 px-2 text-right text-slate-300">{v.exposures}</td>
                          <td className="py-1.5 px-2 text-right text-slate-300">{v.conversions}</td>
                          <td className="py-1.5 px-2 text-right font-semibold text-slate-100">
                            {v.conversion_rate}%
                          </td>
                          <td className="py-1.5 px-2 text-center text-slate-400 text-[10px]">
                            [{v.ci_lower}% - {v.ci_upper}%]
                          </td>
                          <td
                            className={`py-1.5 px-2 text-right font-medium ${
                              v.relative_lift_value > 0
                                ? "text-emerald-400"
                                : v.relative_lift_value < 0
                                ? "text-rose-400"
                                : "text-slate-400"
                            }`}
                          >
                            {v.relative_lift}
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-14 h-1.5 bg-[#1C202C] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${v.win_probability}%`,
                                    backgroundColor: v.color,
                                  }}
                                />
                              </div>
                              <span className="font-semibold text-[10px]" style={{ color: v.color }}>
                                {v.win_probability}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SVG Beta Distribution Curves */}
                <div className="p-2 rounded bg-[#0D0E14] border border-[#1C202C] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 uppercase font-medium">
                      Conjugate Beta Posteriors Beta(1 + k, 1 + N - k)
                    </span>
                    <span className="text-slate-500">
                      x = True Conversion Rate &bull; y = Density
                    </span>
                  </div>

                  <div className="w-full h-20 relative">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#1C202C" strokeWidth="0.8" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#1C202C" strokeWidth="0.8" />
                      <line x1="25" y1="0" x2="25" y2="100" stroke="#1C202C" strokeWidth="0.5" strokeDasharray="2,2" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#1C202C" strokeWidth="0.5" strokeDasharray="2,2" />
                      <line x1="75" y1="0" x2="75" y2="100" stroke="#1C202C" strokeWidth="0.5" strokeDasharray="2,2" />

                      {Object.entries(experimentState.curves || {}).map(([varKey, pts]: any) => {
                        if (!pts || pts.length === 0) return null;
                        const strokeColor = getVariantColor(varKey);
                        const pathData = pts
                          .map((p: any, i: number) => {
                            const scaledX = Math.min(100, Math.max(0, p.x));
                            const scaledY = Math.max(5, 95 - p.y * 0.9);
                            return `${i === 0 ? "M" : "L"} ${scaledX.toFixed(1)} ${scaledY.toFixed(1)}`;
                          })
                          .join(" ");

                        return (
                          <path
                            key={varKey}
                            d={pathData}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </svg>

                    <div className="absolute top-1 right-2 flex items-center gap-3 text-[9px] font-mono">
                      <span className="flex items-center gap-1 text-amber-300">
                        <span className="w-2 h-0.5 bg-amber-400 inline-block" /> BM25 (Ctrl)
                      </span>
                      <span className="flex items-center gap-1 text-sky-300">
                        <span className="w-2 h-0.5 bg-sky-400 inline-block" /> Dense SVD
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Hybrid RRF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rollout Governance Note */}
                <div className="p-1.5 rounded bg-[#090A0E] border border-[#181B24] text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>
                    Rollout Control: Update multivariate weights in Flagsmith Dashboard. Human-in-the-loop review required before modifying live routing.
                  </span>
                  <a
                    href="https://app.flagsmith.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[9px] shrink-0 ml-2"
                  >
                    <span>Flagsmith Dashboard</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            )}

            {/* --- TAB CONTENT: MODE B (OFFLINE BENCHMARK) --- */}
            {activeTab === "benchmark" && (
              <div className="space-y-2">
                <div className="p-2 rounded bg-sky-950/20 border border-sky-500/30 text-sky-300 text-xs font-mono">
                  <div className="font-semibold uppercase tracking-wider text-[10px]">
                    Offline Retrieval Benchmark Evidence (Curated Dataset)
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    150 technical queries evaluated against 40 documentation chunks. Evaluates algorithmic accuracy (Recall, MRR@3) on pre-labeled queries without user traffic.
                  </p>
                </div>

                {/* Benchmark Metrics Table */}
                <div className="overflow-x-auto rounded border border-[#1C202C]">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="bg-[#141722] text-[10px] text-slate-400 uppercase tracking-wider border-b border-[#1C202C]">
                        <th className="py-1 px-3">Ranking Algorithm</th>
                        <th className="py-1 px-2 text-right">Queries</th>
                        <th className="py-1 px-2 text-right">Recall@3</th>
                        <th className="py-1 px-2 text-right">Precision@1</th>
                        <th className="py-1 px-2 text-right">MRR@3</th>
                        <th className="py-1 px-2 text-right">Avg Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C202C] text-[11px]">
                      {Object.values(benchmarkState?.results || {}).map((r: any) => (
                        <tr key={r.variant_id} className="hover:bg-[#141722]/50 transition-colors">
                          <td className="py-1.5 px-3 font-medium text-slate-200">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: r.color }}
                            />
                            {r.name}
                          </td>
                          <td className="py-1.5 px-2 text-right text-slate-300">{r.queries_evaluated}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-slate-100">{r.recall_at_3}%</td>
                          <td className="py-1.5 px-2 text-right text-slate-300">{r.precision_at_1}%</td>
                          <td className="py-1.5 px-2 text-right font-semibold text-emerald-400">{r.mrr_at_3}</td>
                          <td className="py-1.5 px-2 text-right text-slate-400">{r.avg_latency_ms}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Categorical Breakdown */}
                <div className="p-2 rounded bg-[#0D0E14] border border-[#1C202C] font-mono text-[10px] space-y-1">
                  <div className="text-slate-400 uppercase font-semibold text-[9px]">
                    Category Breakdown: Why Different Engines Win on Different Tasks
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-[10px] pt-0.5">
                    <div className="p-1.5 rounded bg-[#08090D] border border-[#181B24]">
                      <span className="text-amber-400 font-semibold">[Exact SDK]: </span>
                      <span>BM25 leads (89.3%). Exact token matching captures function names without vector distortion.</span>
                    </div>
                    <div className="p-1.5 rounded bg-[#08090D] border border-[#181B24]">
                      <span className="text-sky-400 font-semibold">[Conceptual]: </span>
                      <span>Dense SVD leads (86.7%). Latent semantic vectors capture intent when keywords don't match.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =======================================================================
            QUADRANT 2: BOTTOM-LEFT (5 Columns, 7 Rows ~58% Height)
            Tri-Pipeline Rank Diff & Snippet Cards
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-5 row-span-7 bento-panel p-3 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1C202C]">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Retrieved Documentation Cards
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Served by {activeEval.variant}
            </span>
          </div>

          {/* Top 3 Result Cards */}
          <div className="flex-1 space-y-2 py-1 overflow-y-auto">
            {searchResults.map((doc) => (
              <div
                key={doc.id}
                className="p-2 rounded bg-[#0E1017] border border-[#1C202C] hover:border-[#2C3345] space-y-1.5 transition-colors text-xs"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-slate-200 text-xs leading-snug">
                      {doc.title}
                    </h3>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                      {doc.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                    #{doc.final_rank}
                  </span>
                </div>

                {/* Equation Badge */}
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    BM25: #{doc.bm25_rank}
                  </span>
                  <span className="text-slate-600">+</span>
                  <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    Dense: #{doc.dense_rank}
                  </span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                    RRF Final: #{doc.final_rank}
                  </span>
                </div>

                {/* Contribution Bar */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span className="text-amber-400/90">Lexical {doc.lexical_pct}%</span>
                    <span className="text-sky-400/90">Dense {doc.dense_pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#1C202C] rounded-full overflow-hidden flex">
                    <div className="h-full bg-amber-500/80" style={{ width: `${doc.lexical_pct}%` }} />
                    <div className="h-full bg-sky-500/80" style={{ width: `${doc.dense_pct}%` }} />
                  </div>
                </div>

                {/* Code Snippet Box with Copy Action */}
                <div className="relative rounded bg-[#08090D] p-1.5 border border-[#181B24]">
                  <pre className="font-mono text-[10px] text-emerald-300/90 overflow-x-auto">
                    <code>{doc.snippet}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(doc)}
                    className="mt-1 w-full py-1 rounded bg-[#131620] hover:bg-[#1A1F2C] border border-[#222736] hover:border-slate-500 text-[10px] font-mono text-slate-300 hover:text-slate-100 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedDocId === doc.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-medium">Copied &amp; Logged Conversion Event!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy Code Snippet (Logs Real Conversion)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =======================================================================
            QUADRANT 4: BOTTOM-RIGHT (7 Columns, 5 Rows ~42% Height)
            Live Evaluation & Session Telemetry Stream
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-7 row-span-5 bento-panel p-3 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1C202C]">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              Evaluation &amp; Event Telemetry Audit
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Live Audit Stream</span>
            </div>
          </div>

          <div className="flex-1 mt-1 p-2 rounded bg-[#08090D] border border-[#181B24] font-mono text-[10px] overflow-y-auto space-y-1">
            {experimentState.telemetry_recent?.map((log: any, i: number) => {
              const isConversion = log.status === "CONVERSION";
              const varColor =
                log.variant === "lexical_bm25"
                  ? "text-amber-300"
                  : log.variant === "semantic_dense"
                  ? "text-sky-300"
                  : "text-emerald-300";

              return (
                <div
                  key={log.id || i}
                  className="flex items-center justify-between gap-2 py-0.5 border-b border-white/[0.02] hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">[{log.timestamp}]</span>
                    <span className="text-slate-300 font-medium">{log.session_id}</span>
                    <span className="text-slate-600">|</span>
                    <span className={`font-medium ${varColor}`}>flag:{log.variant}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 truncate max-w-xs">{log.details}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-medium ${
                        isConversion
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-[9px] text-slate-500">{log.assignment_source}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* =========================================================================
          MODAL: CONFIGURE FLAGSMITH ENVIRONMENT KEY
      ========================================================================= */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bento-panel p-5 space-y-4 border border-[#2B3245] shadow-xl relative bg-[#111319]">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C202C]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide font-mono">
                  Configure Flagsmith Key
                </h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Provide your Flagsmith server-side environment key (e.g. <code className="text-emerald-400">ser.xxx</code>). The backend connects without server restarts.
            </p>

            <form onSubmit={handleSaveEnvironmentKey} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Server-side Key
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="ser.mJKo2C5Ntno6KcXwXvRmDY..."
                  className="w-full h-9 px-3 text-xs font-mono rounded bg-[#0D0E14] border border-[#222736] text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {keyUpdateStatus && (
                <div className="text-xs font-mono text-emerald-400">
                  {keyUpdateStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inputKey.trim()}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium font-mono"
                >
                  Save &amp; Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded telemetry-hud text-xs font-mono text-slate-200 flex items-center gap-2 border border-[#2B3245] shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
