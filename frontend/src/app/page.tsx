"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
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
    winner_detected: false,
    winner_variant: "hybrid_rrf",
    winner_lift: "+36.2%",
    winner_probability: 97.4,
    telemetry_recent: [],
    total_benchmark_queries: 0,
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
        triggerToast("Event 'doc_snippet_resolved' logged to Bayesian Engine");
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
        triggerToast("Streamed 150 real queries. Bayesian posteriors updated");
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
        triggerToast("Reset posteriors to uniform prior Beta(1, 1)");
      }
    } catch (e) {
      console.error("Reset failed:", e);
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
        setKeyUpdateStatus("Connected successfully");
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
      triggerToast("Simulated 85ms latency spike: Triggered SLA Kill-Switch Fallback");
    }
  };

  // Helper for refined, professional variant badges (Desaturated, technical tones)
  const getVariantBadge = (v: string) => {
    if (v === "lexical_bm25") {
      return {
        bg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        label: "lexical_bm25",
        color: "#D99B26",
      };
    }
    if (v === "semantic_dense") {
      return {
        bg: "bg-sky-500/10 text-sky-300 border-sky-500/20",
        label: "semantic_dense",
        color: "#38BDF8",
      };
    }
    return {
      bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      label: "hybrid_rrf (Winner)",
      color: "#10B981",
    };
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#090A0F] text-slate-200 engineering-canvas select-none">
      {/* =========================================================================
          TOP COMMAND BAR (56px) - Clean, Authoritative Engineering Navigation
      ========================================================================= */}
      <header className="h-14 border-b border-[#1C202C] px-4 flex items-center justify-between shrink-0 bg-[#0C0E14]/95 backdrop-blur-md z-20">
        {/* Left: Brand + Status Pill + Key Modal Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wider text-slate-100 font-mono">
                SEARCHFORGE
              </span>
              <span className="text-[9px] font-mono text-slate-500 tracking-wide uppercase">
                Flagsmith Bayesian Bench
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#222736] mx-1" />

          {/* Connection Status Pill */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#131620] border border-[#222736] hover:border-slate-500 text-xs transition-colors"
            title="Configure Flagsmith Environment Key"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                config.is_live ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span className="font-mono text-[11px] text-slate-300">
              {config.is_live
                ? `LIVE: Flagsmith Edge (${config.environment_key_masked})`
                : "LOCAL EVALUATION MODE"}
            </span>
            <Key className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
        </div>

        {/* Center: Flagsmith Remote Config HUD */}
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

        {/* Right: Kill-Switch Indicator */}
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
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 font-mono">
                <Search className="w-3.5 h-3.5 text-sky-400" />
                Query &amp; Identity Trait Inspector
              </span>
              <span className="text-[10px] font-mono text-slate-400">
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
                  placeholder="Search documentation chunks..."
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
                <span>{isSearching ? "Searching..." : "Search"}</span>
              </button>
            </form>

            {/* 4 Demo Preset Chips */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleSelectPreset("sdk")}
                className="p-1.5 rounded bg-[#0E1017] border border-[#1F2432] hover:border-amber-500/40 text-left transition-all group"
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
                className="p-1.5 rounded bg-[#0E1017] border border-[#1F2432] hover:border-sky-500/40 text-left transition-all group"
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
                className="p-1.5 rounded bg-[#0E1017] border border-[#1F2432] hover:border-emerald-500/40 text-left transition-all group"
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
                className="p-1.5 rounded bg-[#0E1017] border border-[#1F2432] hover:border-rose-500/40 text-left transition-all group"
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

          {/* Micro-Glass Sub-Panel: Live Flagsmith Identity & Trait Payload */}
          <div className="mt-2 p-2 rounded bg-[#0D0E14] border border-[#1C202C] font-mono text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-medium">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Flagsmith Identity Context
              </span>
              {activeEval.segment_override ? (
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[9px]">
                  OVERRIDE: {activeEval.segment_name}
                </span>
              ) : (
                <span className="text-slate-500 text-[9px]">MULTIVARIATE HASH</span>
              )}
            </div>

            <div className="p-1.5 rounded bg-[#08090D] text-[10px] text-slate-300 overflow-x-auto border border-[#181B24]">
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
                  className="font-semibold uppercase"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1C202C]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-200 uppercase flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Bayesian Experimentation Arena
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Conjugate Beta-Binomial
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  10,000-draw Monte Carlo sampling over live retrieval stream
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunBenchmarkStream}
                  disabled={isStreaming}
                  className="h-7 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium font-mono flex items-center gap-1.5 transition-colors border border-emerald-500/30"
                >
                  <Play className={`w-3 h-3 ${isStreaming ? "animate-spin" : ""}`} />
                  <span>
                    {isStreaming
                      ? `Running (${streamProgress.current}/150)...`
                      : "Stream 150 Queries"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetPosteriors}
                  className="h-7 px-2.5 rounded bg-[#131620] border border-[#222736] hover:border-slate-500 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors"
                  title="Reset posteriors to Beta(1, 1)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* 3-Variant Bayesian Comparison Matrix Table */}
            <div className="overflow-x-auto rounded border border-[#1C202C]">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-[#141722] text-[10px] text-slate-400 uppercase tracking-wider border-b border-[#1C202C]">
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
                <tbody className="divide-y divide-[#1C202C] text-[11px]">
                  {bayesianState.variants.map((v: any) => {
                    const badge = getVariantBadge(v.variant_id);
                    return (
                      <tr key={v.variant_id} className="hover:bg-[#141722]/50 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-200">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: badge.color }}
                          />
                          {v.name}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-400 text-[10px]">
                          {v.split_pct}%
                        </td>
                        <td className="py-2 px-2 text-right text-slate-300">{v.exposures}</td>
                        <td className="py-2 px-2 text-right text-slate-300">{v.conversions}</td>
                        <td className="py-2 px-2 text-right font-semibold text-slate-100">
                          {v.conversion_rate}%
                        </td>
                        <td className="py-2 px-2 text-right text-slate-300">{v.mrr_at_3}</td>
                        <td
                          className={`py-2 px-2 text-right font-medium ${
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
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-[#1C202C] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${v.win_probability}%`,
                                  backgroundColor: badge.color,
                                }}
                              />
                            </div>
                            <span className="font-semibold text-[10px]" style={{ color: badge.color }}>
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
            <div className="p-2.5 rounded bg-[#0D0E14] border border-[#1C202C] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase font-medium">
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
                  <line x1="0" y1="80" x2="100" y2="80" stroke="#1C202C" strokeWidth="0.8" />
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#1C202C" strokeWidth="0.8" />
                  <line x1="25" y1="0" x2="25" y2="100" stroke="#1C202C" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#1C202C" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="75" y1="0" x2="75" y2="100" stroke="#1C202C" strokeWidth="0.5" strokeDasharray="2,2" />

                  {/* Beta Curves */}
                  {Object.entries(bayesianState.curves || {}).map(([varKey, pts]: any) => {
                    if (!pts || pts.length === 0) return null;
                    const strokeColor =
                      varKey === "lexical_bm25"
                        ? "#D99B26"
                        : varKey === "semantic_dense"
                        ? "#38BDF8"
                        : "#10B981";

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
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>

                {/* SVG Legend */}
                <div className="absolute top-1 right-2 flex items-center gap-3 text-[9px] font-mono">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded-full" /> BM25 (Ctrl)
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-300">
                    <span className="w-2.5 h-0.5 bg-sky-400 inline-block rounded-full" /> Dense SVD
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-2.5 h-0.5 bg-emerald-400 inline-block rounded-full" /> Hybrid RRF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Winner Banner */}
          {bayesianState.winner_detected && (
            <div className="mt-2 p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold uppercase tracking-wide">Statistical Winner Detected:</span>
                <span className="font-mono text-white font-medium">hybrid_rrf</span>
                <span className="text-emerald-400">
                  ({bayesianState.winner_lift} Lift &bull; {bayesianState.winner_probability}% Win Prob)
                </span>
              </div>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ready to Roll Out
              </span>
            </div>
          )}
        </section>

        {/* =======================================================================
            QUADRANT 2: BOTTOM-LEFT (5 Columns, 7 Rows ~58% Height)
            Tri-Pipeline Rank Diff & Snippet Cards
        ======================================================================= */}
        <section className="col-span-12 lg:col-span-5 row-span-7 bento-panel p-3 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1C202C]">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Tri-Pipeline Rank Diff &amp; Snippet Cards
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Top 3 by {activeEval.variant}
            </span>
          </div>

          {/* Top 3 Result Cards */}
          <div className="flex-1 space-y-2 py-1 overflow-y-auto">
            {searchResults.map((doc) => (
              <div
                key={doc.id}
                className="p-2.5 rounded bg-[#0E1017] border border-[#1C202C] hover:border-[#2C3345] space-y-1.5 transition-colors text-xs"
              >
                {/* Header: Title & Category */}
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

                {/* Visual Rank Fusion Equation Badge */}
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
                    RRF Final: #{doc.final_rank} ({doc.score})
                  </span>
                </div>

                {/* Horizontal Contribution Bar (% Lexical vs % Semantic) */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span className="text-amber-400/90">Lexical {doc.lexical_pct}%</span>
                    <span className="text-sky-400/90">Dense {doc.dense_pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#1C202C] rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-amber-500/80"
                      style={{ width: `${doc.lexical_pct}%` }}
                    />
                    <div
                      className="h-full bg-sky-500/80"
                      style={{ width: `${doc.dense_pct}%` }}
                    />
                  </div>
                </div>

                {/* Code Snippet Box with Copy Action */}
                <div className="relative rounded bg-[#08090D] p-2 border border-[#181B24]">
                  <pre className="font-mono text-[10px] text-emerald-300/90 overflow-x-auto">
                    <code>{doc.snippet}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(doc)}
                    className="mt-1.5 w-full py-1 rounded bg-[#131620] hover:bg-[#1A1F2C] border border-[#222736] hover:border-slate-500 text-[10px] font-mono text-slate-300 hover:text-slate-100 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedDocId === doc.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-medium">Copied &amp; Fired Conversion Event</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
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
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1C202C]">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              Live Flagsmith Evaluation Telemetry Stream
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Live Stream</span>
            </div>
          </div>

          {/* Terminal-style stream log */}
          <div className="flex-1 mt-1.5 p-2 rounded bg-[#08090D] border border-[#181B24] font-mono text-[10px] overflow-y-auto space-y-1">
            {bayesianState.telemetry_recent?.map((log: any, i: number) => {
              const isHit = log.status === "HIT";
              const isConversion = log.event === "doc_snippet_resolved";
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
                    <span className="text-slate-300 font-medium">{log.user_id}</span>
                    <span className="text-slate-600">|</span>
                    <span className={`font-medium ${varColor}`}>flag:{log.variant}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">{log.latency_ms}ms</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 truncate max-w-xs">{log.query || "benchmark_query"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-medium ${
                        isHit
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {log.status} {log.rank && log.rank !== "-" ? `(#${log.rank})` : ""}
                    </span>
                    {isConversion && (
                      <span className="text-[9px] text-emerald-400 font-medium">RESOLVED</span>
                    )}
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
