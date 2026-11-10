"use client";

import React, { useState } from "react";
import { Zap, Users, ArrowUpRight } from "lucide-react";
import { runSwarm } from "@/lib/api";

interface SwarmSimulatorProps {
  onSwarmCompleted: () => void;
  onEventTracked: (event: any) => void;
}

export const SwarmSimulator: React.FC<SwarmSimulatorProps> = ({ onSwarmCompleted, onEventTracked }) => {
  const [userCount, setUserCount] = useState<number>(1500);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeDotsCount, setActiveDotsCount] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleRunSwarm = async () => {
    setIsRunning(true);
    setActiveDotsCount(0);
    setSimulationResult(null);

    const totalSteps = 12;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveDotsCount(Math.min(userCount, Math.floor((step / totalSteps) * userCount)));
      if (step >= totalSteps) clearInterval(interval);
    }, 60);

    try {
      const result = await runSwarm(userCount);
      clearInterval(interval);
      setActiveDotsCount(userCount);
      setSimulationResult(result);
      onSwarmCompleted();

      if (result.recent_events && result.recent_events.length > 0) {
        result.recent_events.slice(0, 3).forEach((ev: any) => onEventTracked(ev));
      }
    } catch (err) {
      console.error(err);
      clearInterval(interval);
    } finally {
      setIsRunning(false);
    }
  };

  const totalDisplayDots = 500;
  const activeDisplayDots = Math.floor((activeDotsCount / userCount) * totalDisplayDots);

  return (
    <div className="clean-card p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E3DA]">
        <div>
          <h2 className="text-base font-semibold text-[#181716] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#059669]" />
            <span>Developer Swarm Simulator</span>
          </h2>
          <p className="text-xs text-[#6B665E] mt-0.5">
            Concurrently simulate developer personas across the 33/33/34 traffic split.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-[#9C968B] block">Volume</span>
            <span className="text-sm font-semibold text-[#181716]">{userCount.toLocaleString()} sessions</span>
          </div>

          <button
            onClick={handleRunSwarm}
            disabled={isRunning}
            className="tactile-btn tactile-btn-emerald py-2 px-4 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Simulating..." : "Run Swarm"}</span>
          </button>
        </div>
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E7E3DA]">
        <span className="text-xs font-mono-code text-[#9C968B]">100</span>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={userCount}
          onChange={(e) => setUserCount(Number(e.target.value))}
          disabled={isRunning}
          aria-label="Developer volume"
          className="flex-1 accent-[#181716] cursor-pointer"
        />
        <span className="text-xs font-mono-code text-[#9C968B]">2,000</span>
      </div>

      {/* Hardware Dot Matrix */}
      <div className="p-4 rounded-xl bg-[#181716] space-y-2.5 shadow-inner">
        <div className="flex items-center justify-between text-xs font-mono-code text-[#9C968B] border-b border-[#2D2A26] pb-2">
          <span>Active Sessions: {activeDotsCount} / {userCount}</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#FBBF24]">Variant A (33%)</span>
            <span className="text-[#34D399] font-semibold">Variant B (33%)</span>
            <span className="text-[#C084FC]">Variant C (34%)</span>
          </div>
        </div>

        <div className="dot-matrix py-1">
          {Array.from({ length: totalDisplayDots }).map((_, i) => {
            const isActive = i < activeDisplayDots;
            const dotColor = !isActive
              ? "bg-[#2D2A26]"
              : i % 3 === 0
              ? "bg-[#FBBF24]"
              : i % 3 === 1
              ? "bg-[#34D399]"
              : "bg-[#C084FC]";

            return <div key={i} className={`dot-unit ${dotColor}`} />;
          })}
        </div>
      </div>

      {/* Developer Personas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E3DA] space-y-1">
          <div className="font-semibold text-[#181716]">Hacker Persona</div>
          <p className="text-[#6B665E] leading-relaxed">
            Prioritizes latency (&lt;1500ms). Abandons slow pipelines like Variant C.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E3DA] space-y-1">
          <div className="font-semibold text-[#059669]">Architect Persona</div>
          <p className="text-[#6B665E] leading-relaxed">
            Prioritizes correctness. Converts heavily on Variant B (Clustered Hybrid).
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E3DA] space-y-1">
          <div className="font-semibold text-[#2563EB]">Pragmatist Persona</div>
          <p className="text-[#6B665E] leading-relaxed">
            Runs snippets in sandbox. Balances speed with verifiable accuracy.
          </p>
        </div>
      </div>

      {/* Swarm Telemetry Results */}
      {simulationResult && (
        <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#065F46]">
            <span>Simulation Ingested: {simulationResult.total_exposures} exposures ({simulationResult.total_conversions} conversions)</span>
            <span className="text-[11px] font-mono-code px-2 py-0.5 rounded-full bg-[#D1FAE5] border border-[#A7F3D0]">
              Telemetry Synced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-[#A7F3D0]">
              <span className="text-[#6B665E] block">Variant A (Zero-Shot)</span>
              <span className="text-base font-bold text-[#181716]">11.2% Conversion</span>
              <span className="text-[11px] text-[#9C968B] block mt-0.5">56 / 500 converted (540ms)</span>
            </div>

            <div className="p-3 rounded-lg bg-white border-2 border-[#059669] shadow-xs">
              <span className="text-[#059669] font-semibold block">Variant B (Hybrid) [Winner]</span>
              <span className="text-base font-bold text-[#059669]">24.8% Conversion</span>
              <span className="text-[11px] text-[#059669] block mt-0.5">124 / 500 converted (1080ms)</span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-[#A7F3D0]">
              <span className="text-[#6B665E] block">Variant C (Agentic CoT)</span>
              <span className="text-base font-bold text-[#181716]">16.5% Conversion</span>
              <span className="text-[11px] text-[#9C968B] block mt-0.5">83 / 500 converted (2810ms)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
