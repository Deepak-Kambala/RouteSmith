"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Play,
  RotateCcw,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  Sliders,
  ExternalLink,
  Key,
  X,
  Search,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  Flame,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function SearchForgeDashboard() {
  // --- State Variables ---
  const [query, setQuery] = useState("get_identity_flags transient trait");
  const [latencyMs, setLatencyMs] = useState<number>(0.4);
  const [isSearching, setIsSearching] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState({ current: 150, total: 150, avgMs: 1.8 });
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Key Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [keyUpdateStatus, setKeyUpdateStatus] = useState<string | null>(null);

  // Flagsmith & Remote Config State
  const [config, setConfig] = useState<any>({
    is_live: false,
    mode: "local_fallback",
    environment_key_masked: "NONE",
    active_flags: {
      flag_key: "retrieval_ranking_engine",
      alpha: 0.45,
      rrf_k: 60,
      code_boost: 1.35,
      latency_sla_ms: 25.0,
      kill_switch_active: false,
    },
  });

  // Current Query Evaluation Details
  const [activeEval, setActiveEval] = useState<any>({
    identifier: "dev_session_01",
    traits: { has_error_code: true, query_tokens: 3, tier: "developer" },
    variant: "lexical_bm25",
    kill_switch_active: false,
    segment_override: true,
    segment_name: "Error Code Diagnosticians",
    remote_config: { alpha: 0.45, rrf_k: 60, code_boost: 1.35, latency_sla_ms: 25.0 },
  });

  // Retrieved Top 3 Documentation Chunks
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Bayesian Matrix & Posterior State
  const [bayesianState, setBayesianState] = useState<any>({
    variants: [],
    curves: {},
    winner_detected: true,
    winner_variant: "hybrid_rrf",
    winner_lift: "+36.2%",
    winner_probability: 97.4,
    telemetry_recent: [],
    total_benchmark_queries: 150,
  });

  // --- Initial Data Fetch ---
  useEffect(() => {
    fetchConfig();
    fetchBayesianState();
    handleExecuteSearch("get_identity_flags transient trait");
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

  const fetchBayesianState = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bayesian/state`);
      if (res.ok) {
        const data = await res.json();
        setBayesianState(data);
      }
    } catch (e) {
      console.warn("Backend bayesian state fetch failed:", e);
    }
  };

  // --- Search Execution ---
  const handleExecuteSearch = async (
    searchQuery: string,
    overrideTraits?: Record<string, any>,
    simulateLatency: boolean = false
  ) => {
    setIsSearching(true);
    const q = searchQuery || query;
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
          user_id: "dev_session_01",
          traits: traits,
          simulate_latency: simulateLatency,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveEval(data.flagsmith);
        setSearchResults(data.search.results || []);
        setLatencyMs(data.latency_ms);
      }
    } catch (e) {
      console.error("Search execution failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  // --- Copy Snippet & Fire Conversion Event ---
  const handleCopySnippet = async (doc: any) => {
    try {
      await navigator.clipboard.writeText(doc.snippet);
      setCopiedDocId(doc.id);
      setTimeout(() => setCopiedDocId(null), 1800);

      // Fire conversion to backend
      const res = await fetch(`${BACKEND_URL}/api/conversion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: activeEval.variant || "hybrid_rrf",
          doc_id: doc.id,
          rank: doc.final_rank || 1,
          user_id: activeEval.identifier || "dev_session_01",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBayesianState(data.state);
        triggerToast("✓ Event 'doc_snippet_resolved' logged to Flagsmith Bayesian Engine");
      }
    } catch (e) {
      console.warn("Conversion tracking error:", e);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // --- 150-Query Benchmark Stream ---
  const handleRunBenchmarkStream = async () => {
    if (isStreaming) return;
    setIsStreaming(true);
    setStreamProgress({ current: 0, total: 150, avgMs: 1.8 });

    // Animate progress ticker
    const interval = setInterval(() => {
      setStreamProgress((prev) => {
        if (prev.current < 150) {
          const next = Math.min(150, prev.current + 18);
          return { ...prev, current: next };
        }
        return prev;
      });
    }, 120);

    try {
      const res = await fetch(`${BACKEND_URL}/api/bayesian/benchmark`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setBayesianState(data.state);
        triggerToast("✓ Streamed 150 real queries. Bayesian posteriors updated!");
      }
    } catch (e) {
      console.error("Benchmark failed:", e);
    } finally {
      clearInterval(interval);
      setStreamProgress({ current: 150, total: 150, avgMs: 1.8 });
      setIsStreaming(false);
    }
  };

  // --- Reset Posteriors ---
  const handleResetPosteriors = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bayesian/reset`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBayesianState(data.state);
        triggerToast("↺ Reset posteriors to uniform prior Beta(1, 1)");
      }
    } catch (e) {
      console.error("Reset failed:", e);
    }
  };

  // --- Update Environment Key at Runtime ---
  const handleSaveEnvironmentKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setKeyUpdateStatus("Connecting...");
    try {
      const res = await fetch(`${BACKEND_URL}/api/config/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment_key: inputKey.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.status);
        setKeyUpdateStatus("Connected!");
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
      handleExecuteSearch(q, { has_error_code: true, query_tokens: 3, tier: "developer" }, false);
    } else if (chipType === "concept") {
      const q = "gradually test two ranking algorithms on 20% of traffic";
      setQuery(q);
      handleExecuteSearch(q, { has_error_code: false, query_tokens: 9, tier: "standard" }, false);
    } else if (chipType === "hybrid") {
      const q = "override segment config for enterprise users with code";
      setQuery(q);
      handleExecuteSearch(q, { has_error_code: false, query_tokens: 8, tier: "enterprise" }, false);
    } else if (chipType === "latency") {
      const q = "simulate latency spike and circuit breaker fallback";
      setQuery(q);
      handleExecuteSearch(q, { has_error_code: false, query_tokens: 7, tier: "developer" }, true);
      triggerToast("🚨 Injected 85ms latency spike: Triggered SLA Kill-Switch Fallback!");
    }
  };

  // Helper for algorithm badge styling
  const getVariantBadge = (v: string) => {
    if (v === "lexical_bm25") {
      return {
        bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        label: "lexical_bm25",
        color: "#F59E0B",
      };
    }
    if (v === "semantic_dense") {
      return {
        bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        label: "semantic_dense",
        color: "#06B6D4",
      };
    }
    return {
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      label: "hybrid_rrf (Winner)",
      color: "#10B981",
    };
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#07080C] text-slate-100 dot-matrix-bg select-none">
      {/* =========================================================================
          TOP COMMAND BAR (56px)
      ========================================================================= */}
      <header className="h-14 border-b border-[#1C2030] px-4 flex items-center justify-between shrink-0 bg-[#090B11]/90 backdrop-blur-md z-20">
        {/* Left: Brand + Status Pill + Key Modal Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold font-telemetry">
              ⚡
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-[0.08em] uppercase text-slate-200">
                SEARCHFORGE
              </span>
              <span className="text-[9px] font-telemetry text-slate-500 uppercase tracking-wider">
                FLAGSMITH BAYESIAN BENCH
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#1C2030] mx-1" />

          {/* Connection Status Pill */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#131724] border border-[#1C2030] hover:border-slate-600 text-xs transition-colors"
            title="Click to configure live Flagsmith Environment Key"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                config.is_live
                  ? "bg-emerald-400 shadow-[0_0_8px_#10B981]"
                  : "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
              }`}
            />
            <span className="font-telemetry text-[11px] text-slate-300">
              {config.is_live
                ? `LIVE: Flagsmith Edge (${config.environment_key_masked})`
                : "LOCAL FALLBACK MODE"}
            </span>
            <span className="text-[10px] text-slate-500 hover:text-slate-300 ml-1">
              🔑 Key
            </span>
          </button>
        </div>

        {/* Center: Flagsmith Remote Config HUD */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md acrylic-hud text-[11px] font-telemetry text-slate-300">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase font-semibold">
            Flag: retrieval_ranking_engine
          </span>
          <span className="text-slate-600">&bull;</span>
          <span>α: <strong className="text-emerald-400">{config.active_flags?.alpha ?? 0.45}</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span>rrf_k: <strong className="text-slate-200">{config.active_flags?.rrf_k ?? 60}</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span>boost: <strong className="text-cyan-400">{config.active_flags?.code_boost ?? 1.35}x</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span>SLA: <strong className="text-amber-400">&le;{config.active_flags?.latency_sla_ms ?? 25}ms</strong></span>
        </div>

        {/* Right: Kill-Switch Indicator */}
        <div className="flex items-center gap-2">
          {activeEval.kill_switch_active ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-rose-500/60 bg-rose-950/30 text-rose-400 text-xs font-telemetry animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-semibold text-[11px] uppercase tracking-wide">
                🚨 KILL-SWITCH ACTIVE: FORCED BM25
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#1C2030] bg-[#0D0F17] text-slate-400 text-xs font-telemetry">
              <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                KILL-SWITCH: ARMED (OFF)
              </span>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          12-COLUMN, 2-ROW BENTO WORKSPACE (calc(100vh - 56px))
      ========================================================================= */}
      <main className="flex-1 p-3 grid grid-cols-12 grid-rows-12 gap-3 overflow-hidden">
        {/* =======================================================================
            QUADRANT 1: TOP-LEFT (5 Columns, 5 Rows ~42% Height)
            Live Query & Flagsmith Identity Trait Inspector
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-5 row-span-5 bento-panel p-3 flex flex-col justify-between overflow-hidden">
          <div className="space-y-2">
            {/* Panel Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase flex items-center gap-1.5">
                <Search className="w-3 h-3 text-cyan-400" />
                Query &amp; Identity Trait Inspector
              </span>
              <span className="text-[10px] font-telemetry text-slate-500">
                CPU Latency: <strong className="text-emerald-400">{latencyMs} ms</strong>
              </span>
            </div>

            {/* High-Contrast Search Input Bar */}
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
                  placeholder="Enter developer search query or SDK identifier..."
                  className="w-full h-8 px-3 pr-10 text-xs font-telemetry rounded-md bg-[#131724] border border-[#1C2030] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                />
                <span className="absolute right-2 top-1.5 text-[10px] font-telemetry text-slate-500 px-1 rounded border border-[#1C2030] bg-[#090B11]">
                  ⌘K
                </span>
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="h-8 px-3 rounded-md bg-[#1C2030] hover:bg-[#282F45] text-slate-200 text-xs font-semibold font-telemetry flex items-center gap-1 transition-colors"
              >
                <span>{isSearching ? "..." : "Search"}</span>
              </button>
            </form>

            {/* 4 Demo Preset Chips */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleSelectPreset("sdk")}
                className="p-1.5 rounded bg-[#131724] border border-[#1C2030] hover:border-amber-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-semibold text-amber-400 font-telemetry">
                    [Exact SDK]
                  </span>
                  <span className="text-[9px] text-slate-500">BM25 Wins</span>
                </div>
                <div className="text-[11px] font-telemetry text-slate-300 truncate">
                  get_identity_flags transient
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("concept")}
                className="p-1.5 rounded bg-[#131724] border border-[#1C2030] hover:border-cyan-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-semibold text-cyan-400 font-telemetry">
                    [Conceptual]
                  </span>
                  <span className="text-[9px] text-slate-500">Dense Wins</span>
                </div>
                <div className="text-[11px] font-telemetry text-slate-300 truncate">
                  gradually test two ranking algos
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("hybrid")}
                className="p-1.5 rounded bg-[#131724] border border-[#1C2030] hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-semibold text-emerald-400 font-telemetry">
                    [Hybrid Code]
                  </span>
                  <span className="text-[9px] text-slate-500">RRF Dominates</span>
                </div>
                <div className="text-[11px] font-telemetry text-slate-300 truncate">
                  override segment config enterprise
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("latency")}
                className="p-1.5 rounded bg-[#131724] border border-[#1C2030] hover:border-rose-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-semibold text-rose-400 font-telemetry">
                    [⚡ Latency Spike]
                  </span>
                  <span className="text-[9px] text-slate-500">Kill-Switch</span>
                </div>
                <div className="text-[11px] font-telemetry text-slate-300 truncate">
                  Simulate 85ms SLA Breach
                </div>
              </button>
            </div>
          </div>

          {/* Micro-Glass Sub-Panel: Live Flagsmith Identity & Trait Payload */}
          <div className="mt-2 p-2 rounded bg-[#090B11]/90 border border-[#1C2030] font-telemetry text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Flagsmith Identity Payload
              </span>
              {activeEval.segment_override ? (
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px]">
                  OVERRIDE: {activeEval.segment_name}
                </span>
              ) : (
                <span className="text-slate-500 text-[9px]">MULTIVARIATE HASH</span>
              )}
            </div>

            <div className="p-1.5 rounded bg-[#07080C] text-[10px] text-slate-300 overflow-x-auto">
              <code>
                {`flagsmith.get_identity_flags(id="${activeEval.identifier}", traits=${JSON.stringify(
                  activeEval.traits
                )})`}
              </code>
            </div>

            <div className="flex items-center justify-between text-[10px] pt-0.5">
              <span className="text-slate-400">
                Resolved Variant:{" "}
                <span
                  className="font-bold uppercase"
                  style={{ color: getVariantBadge(activeEval.variant).color }}
                >
                  {activeEval.variant}
                </span>
              </span>
              <span className="text-slate-500">
                Mode: {activeEval.mode}
              </span>
            </div>
          </div>
        </section>

        {/* =======================================================================
            QUADRANT 3: TOP-RIGHT (7 Columns, 7 Rows ~58% Height)
            Bayesian Experimentation Arena (The Star Panel)
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-7 row-span-7 bento-panel p-3.5 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3">
            {/* Header with Benchmark Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1C2030]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-300 uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Bayesian Experimentation Arena
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-telemetry bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Conjugate Beta-Binomial
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-telemetry mt-0.5">
                  10,000-draw Monte Carlo sampling over sequential evaluation streams
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunBenchmarkStream}
                  disabled={isStreaming}
                  className="h-7 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-telemetry flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
                >
                  <Play className={`w-3 h-3 ${isStreaming ? "animate-spin" : ""}`} />
                  <span>
                    {isStreaming
                      ? `Running (${streamProgress.current}/150)...`
                      : "▶ Stream 150 Queries"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetPosteriors}
                  className="h-7 px-2.5 rounded-md bg-[#131724] border border-[#1C2030] hover:border-slate-500 text-slate-300 text-xs font-telemetry flex items-center gap-1 transition-colors"
                  title="Reset posteriors to Beta(1, 1)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* 3-Variant Bayesian Comparison Matrix Table */}
            <div className="overflow-x-auto rounded border border-[#1C2030]">
              <table className="w-full text-left text-xs font-telemetry border-collapse">
                <thead>
                  <tr className="bg-[#131724]/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-[#1C2030]">
                    <th className="py-1.5 px-3">Variant</th>
                    <th className="py-1.5 px-2 text-center">Split</th>
                    <th className="py-1.5 px-2 text-right">N (Trials)</th>
                    <th className="py-1.5 px-2 text-right">k (Hits)</th>
                    <th className="py-1.5 px-2 text-right">Conv Rate</th>
                    <th className="py-1.5 px-2 text-right">MRR@3</th>
                    <th className="py-1.5 px-2 text-right">Lift vs Ctrl</th>
                    <th className="py-1.5 px-3 text-right">Win Probability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2030] text-[11px]">
                  {bayesianState.variants.map((v: any) => {
                    const badge = getVariantBadge(v.variant_id);
                    return (
                      <tr key={v.variant_id} className="hover:bg-[#131724]/50 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-200">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: badge.color }}
                          />
                          {v.name}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-400 text-[10px]">
                          {v.split_pct}%
                        </td>
                        <td className="py-2 px-2 text-right text-slate-300">{v.exposures}</td>
                        <td className="py-2 px-2 text-right text-slate-300">{v.conversions}</td>
                        <td className="py-2 px-2 text-right font-bold text-slate-100">
                          {v.conversion_rate}%
                        </td>
                        <td className="py-2 px-2 text-right text-slate-300">{v.mrr_at_3}</td>
                        <td
                          className={`py-2 px-2 text-right font-semibold ${
                            v.relative_lift_value > 0
                              ? "text-emerald-400"
                              : v.relative_lift_value < 0
                              ? "text-rose-400"
                              : "text-slate-400"
                          }`}
                        >
                          {v.relative_lift}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-16 h-1.5 bg-[#1C2030] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${v.win_probability}%`,
                                  backgroundColor: badge.color,
                                }}
                              />
                            </div>
                            <span className="font-bold text-[10px]" style={{ color: badge.color }}>
                              {v.win_probability}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Live Posterior Credible Interval Visualizer (Pure Zero-Dependency SVG) */}
            <div className="p-2.5 rounded bg-[#090B11] border border-[#1C2030] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-telemetry">
                <span className="text-slate-400 uppercase font-semibold">
                  95% Posterior Beta Distribution Curves &amp; Credible Intervals
                </span>
                <span className="text-slate-500">
                  x = Conversion Rate (0% &rarr; 80%) &bull; y = Density
                </span>
              </div>

              {/* SVG Beta Curves Chart */}
              <div className="w-full h-24 relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="0" y1="80" x2="100" y2="80" stroke="#1C2030" strokeWidth="0.8" />
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#1C2030" strokeWidth="0.8" />
                  <line x1="25" y1="0" x2="25" y2="100" stroke="#1C2030" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#1C2030" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="75" y1="0" x2="75" y2="100" stroke="#1C2030" strokeWidth="0.5" strokeDasharray="2,2" />

                  {/* Beta Curves */}
                  {Object.entries(bayesianState.curves || {}).map(([varKey, pts]: any) => {
                    if (!pts || pts.length === 0) return null;
                    const strokeColor =
                      varKey === "lexical_bm25"
                        ? "#F59E0B"
                        : varKey === "semantic_dense"
                        ? "#06B6D4"
                        : "#10B981";

                    // Map points: x in [0, 80] -> [0, 100], y in [0, 100] -> [95 - y*0.85, 0]
                    const pathData = pts
                      .map((p: any, i: number) => {
                        const scaledX = Math.min(100, Math.max(0, (p.x / 80) * 100));
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
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>

                {/* SVG Legend */}
                <div className="absolute top-1 right-2 flex items-center gap-3 text-[9px] font-telemetry">
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-0.5 bg-amber-400 inline-block" /> BM25 (Ctrl)
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> Dense SVD
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Hybrid RRF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Winner Banner */}
          {bayesianState.winner_detected && (
            <div className="mt-2 p-2 rounded-md bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-telemetry flex items-center justify-between shadow-[0_0_16px_rgba(16,185,129,0.15)] animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏆</span>
                <span className="font-bold">STATISTICAL WINNER DETECTED:</span>
                <span className="font-mono text-white">hybrid_rrf</span>
                <span className="text-emerald-400">
                  ({bayesianState.winner_lift} Lift &bull; {bayesianState.winner_probability}% Win Prob)
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500 text-[#07080C]">
                Ready to Roll Out in Flagsmith
              </span>
            </div>
          )}
        </section>

        {/* =======================================================================
            QUADRANT 2: BOTTOM-LEFT (5 Columns, 7 Rows ~58% Height)
            Tri-Pipeline Rank Diff & Snippet Cards
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-5 row-span-7 bento-panel p-3 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1C2030]">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-emerald-400" />
              Tri-Pipeline Rank Diff &amp; Snippet Cards
            </span>
            <span className="text-[10px] font-telemetry text-slate-500">
              Top 3 Candidates by {activeEval.variant}
            </span>
          </div>

          {/* Top 3 Result Cards */}
          <div className="flex-1 space-y-2 py-1 overflow-y-auto">
            {searchResults.map((doc, idx) => (
              <div
                key={doc.id}
                className="p-2.5 rounded bg-[#10131E] border border-[#1C2030] hover:border-slate-600 space-y-1.5 transition-all text-xs"
              >
                {/* Header: Title & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-200 text-xs leading-snug">
                      {doc.title}
                    </h3>
                    <span className="text-[9px] font-telemetry text-slate-500 uppercase">
                      {doc.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-telemetry font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                    #{doc.final_rank}
                  </span>
                </div>

                {/* Visual Rank Fusion Equation Badge */}
                <div className="flex items-center gap-1 text-[10px] font-telemetry">
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    BM25: #{doc.bm25_rank}
                  </span>
                  <span className="text-slate-600">+</span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Dense: #{doc.dense_rank}
                  </span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    RRF Final: #{doc.final_rank} ({doc.score})
                  </span>
                </div>

                {/* Horizontal Contribution Bar (% Lexical vs % Semantic) */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-telemetry text-slate-500">
                    <span className="text-amber-400">Lexical {doc.lexical_pct}%</span>
                    <span className="text-cyan-400">Dense {doc.dense_pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#1C2030] rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${doc.lexical_pct}%` }}
                    />
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${doc.dense_pct}%` }}
                    />
                  </div>
                </div>

                {/* Code Snippet Box with Copy Action */}
                <div className="relative rounded bg-[#07080C] p-2 border border-[#1C2030]">
                  <pre className="font-telemetry text-[10px] text-emerald-300 overflow-x-auto">
                    <code>{doc.snippet}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(doc)}
                    className="mt-1.5 w-full py-1 rounded bg-[#131724] hover:bg-emerald-950/40 border border-[#1C2030] hover:border-emerald-500/50 text-[10px] font-telemetry text-slate-300 hover:text-emerald-300 flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedDocId === doc.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied &amp; Fired Conversion Event!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code Snippet (Fire Conversion)</span>
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
            Live Flagsmith Evaluation Telemetry Stream
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-7 row-span-5 bento-panel p-3 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1C2030]">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-cyan-400" />
              Live Flagsmith Evaluation Telemetry Stream
            </span>
            <div className="flex items-center gap-2 text-[10px] font-telemetry text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Tail Stream</span>
            </div>
          </div>

          {/* Terminal-style stream log */}
          <div className="flex-1 mt-1.5 p-2 rounded bg-[#07080C] border border-[#1C2030] font-telemetry text-[10px] overflow-y-auto space-y-1">
            {bayesianState.telemetry_recent?.map((log: any, i: number) => {
              const isHit = log.status === "HIT";
              const isConversion = log.event === "doc_snippet_resolved";
              const varColor =
                log.variant === "lexical_bm25"
                  ? "text-amber-400"
                  : log.variant === "semantic_dense"
                  ? "text-cyan-400"
                  : "text-emerald-400";

              return (
                <div
                  key={log.id || i}
                  className="flex items-center justify-between gap-2 py-0.5 border-b border-white/[0.03] hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">[{log.timestamp}]</span>
                    <span className="text-slate-300 font-semibold">{log.user_id}</span>
                    <span className="text-slate-600">|</span>
                    <span className={`font-bold ${varColor}`}>flag:{log.variant}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">{log.latency_ms}ms</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 truncate max-w-xs">{log.query || "benchmark_query"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-1 rounded text-[9px] font-bold ${
                        isHit
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {log.status} {log.rank && log.rank !== "-" ? `(#${log.rank})` : ""}
                    </span>
                    {isConversion && (
                      <span className="text-[9px] text-emerald-400">✓ RESOLVED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* =========================================================================
          GLASSMORPHIC MODAL: CONFIGURE FLAGSMITH ENVIRONMENT KEY
      ========================================================================= */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bento-panel p-5 space-y-4 border border-white/20 shadow-2xl relative bg-[#0D0F17]">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C2030]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-telemetry">
                  Configure Flagsmith Environment Key
                </h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste your official Flagsmith **Server-side Environment Key** (starts with{" "}
              <code className="text-emerald-400 font-telemetry">ser.</code>). The backend will
              reconfigure live without restarting.
            </p>

            <form onSubmit={handleSaveEnvironmentKey} className="space-y-3">
              <div>
                <label className="text-[10px] font-telemetry uppercase text-slate-400 block mb-1">
                  Server-side Key
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="ser.mJKo2C5Ntno6KcXwXvRmDY..."
                  className="w-full h-9 px-3 text-xs font-telemetry rounded bg-[#131724] border border-[#1C2030] text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {keyUpdateStatus && (
                <div className="text-xs font-telemetry text-emerald-400">
                  {keyUpdateStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded text-xs font-telemetry text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inputKey.trim()}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-telemetry"
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
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-md acrylic-hud text-xs font-telemetry text-emerald-300 flex items-center gap-2 border border-emerald-500/40 shadow-2xl animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
