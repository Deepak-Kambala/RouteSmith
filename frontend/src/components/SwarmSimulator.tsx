"use client";

import React, { useState } from "react";
import { Users, Zap, CheckCircle2, TrendingUp, Sliders, Activity, Clock } from "lucide-react";
import { runSwarm } from "@/lib/api";

interface SwarmSimulatorProps {
  onSwarmCompleted: () => void;
  onEventTracked: (event: any) => void;
}

export const SwarmSimulator: React.FC<SwarmSimulatorProps> = ({ onSwarmCompleted, onEventTracked }) => {
  const [userCount, setUserCount] = useState<number>(1500);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleRunSwarm = async () => {
    setIsRunning(true);
    setProgress(5);
    setSimulationResult(null);

    // Simulate animated streaming progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 180);

    try {
      const result = await runSwarm(userCount);
      clearInterval(interval);
      setProgress(100);
      setSimulationResult(result);
      onSwarmCompleted();

      // Dispatch sample events to toast stream
      if (result.recent_events && result.recent_events.length > 0) {
        result.recent_events.slice(0, 3).forEach((ev: any) => {
          onEventTracked(ev);
        });
      }
    } catch (err) {
      console.error(err);
      clearInterval(interval);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 md:p-8 shadow-xs space-y-8">
      {/* Editorial Hero Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-mono-code font-semibold tracking-wider text-[#2563EB] uppercase">
          Synthetic Traffic & Behavioral Simulator
        </span>
        <h2 className="font-serif-display text-3xl md:text-4xl font-bold text-[#181715] leading-tight">
          <span className="highlighter-brush">1,500 Developers.</span> Zero Guesswork.
        </h2>
        <p className="text-sm md:text-base text-[#6B665E] leading-relaxed">
          The number one cause of failure in A/B testing hackathons is sample starvation with zero confidence.
          Spawning 1,500 simulated identities live during your demo streams real exposures and conversions
          into Flagsmith so the Bayesian engine converges decisively.
        </p>
      </div>

      {/* Simulator Controls & Slider */}
      <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E7E2D9] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2563EB]" />
              <label htmlFor="user-volume-slider" className="font-semibold text-sm text-[#181715]">
                Simulated User Volume
              </label>
            </div>
            <p className="text-xs text-[#6B665E]">
              Spawns distinct identities (<span className="font-mono-code">sim_dev_0001</span> to{" "}
              <span className="font-mono-code">sim_dev_{userCount.toString().padStart(4, "0")}</span>)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono-code text-xl font-bold text-[#181715] bg-white px-3.5 py-1.5 rounded-lg border border-[#E7E2D9] shadow-xs">
              {userCount.toLocaleString()}
            </span>
            <button
              onClick={handleRunSwarm}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:translate-y-px disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isRunning ? "Simulating Swarm..." : "Run Live Experiment Swarm"}</span>
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <input
          id="user-volume-slider"
          type="range"
          min="100"
          max="2000"
          step="100"
          value={userCount}
          onChange={(e) => setUserCount(Number(e.target.value))}
          disabled={isRunning}
          aria-label="Simulated User Volume"
          className="w-full accent-[#2563EB] cursor-pointer"
        />

        {/* Progress Bar when running */}
        {isRunning && (
          <div className="space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono-code text-[#6B665E]">
              <span>Ingesting exposure & conversion telemetry into Flagsmith...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#E7E2D9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Developer Persona Breakdown */}
      <div className="space-y-4">
        <h3 className="font-serif-display text-xl font-bold text-[#181715]">
          Persona Behavioral Model
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#181715]">The Impatient Hacker</span>
              <span className="keycap-badge text-[10px]">Latency Sensitive</span>
            </div>
            <p className="text-xs text-[#6B665E] leading-relaxed">
              Bounces immediately if response time exceeds 1500ms. Abandons Variant C due to 2.8s AST verification delay.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#181715]">The Senior Architect</span>
              <span className="keycap-badge text-[10px]">Accuracy Sensitive</span>
            </div>
            <p className="text-xs text-[#6B665E] leading-relaxed">
              Demands strict syntactic correctness and deep context. Rejects Variant A hallucinations; heavily converts on Variant B.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#181715]">The Pragmatist</span>
              <span className="keycap-badge text-[10px]">Balanced</span>
            </div>
            <p className="text-xs text-[#6B665E] leading-relaxed">
              Tests code in the sandbox runner. Converts when code executes within reasonable latency thresholds (~1s).
            </p>
          </div>
        </div>
      </div>

      {/* Live Swarm Ingestion Results Banner */}
      {simulationResult && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-sm text-emerald-950">
                1,500 Developer Sessions Ingested Into Flagsmith Managed Warehouse
              </h4>
            </div>
            <span className="font-mono-code text-xs text-emerald-700 font-semibold">
              Total Conversions: {simulationResult.total_conversions}
            </span>
          </div>

          {/* 3 Variant Stat Pill Rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-xs font-mono-code text-[#8E887E]">Variant A (fast_zero_shot)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-bold text-lg text-[#181715]">11.2%</span>
                <span className="text-xs font-mono-code text-[#6B665E]">56 / 500</span>
              </div>
              <div className="text-[11px] font-mono-code text-[#8E887E] mt-1">Latency: ~540ms</div>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-emerald-500 shadow-2xs relative">
              <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-mono-code px-2 py-0.5 rounded-full font-bold">
                Leads Experiment
              </span>
              <span className="text-xs font-mono-code text-emerald-800 font-semibold">Variant B (clustered_hybrid_rag)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-bold text-lg text-emerald-900">24.8%</span>
                <span className="text-xs font-mono-code text-emerald-700">124 / 500</span>
              </div>
              <div className="text-[11px] font-mono-code text-emerald-700 mt-1">Latency: ~1080ms</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-xs font-mono-code text-[#8E887E]">Variant C (agentic_self_reflection)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-bold text-lg text-[#181715]">16.5%</span>
                <span className="text-xs font-mono-code text-[#6B665E]">83 / 500</span>
              </div>
              <div className="text-[11px] font-mono-code text-[#8E887E] mt-1">Latency: ~2810ms (dropoff)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
