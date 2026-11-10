"use client";

import React, { useState } from "react";
import { Zap, Users } from "lucide-react";
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
    }, 55);

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
    <div className="pixel-card p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#151413]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-pixel-display text-xs font-bold bg-[#151413] text-[#F8F6F0] px-2 py-0.5">
              SWARM ENGINE
            </span>
            <span className="text-xs font-bold text-[#151413]">
              CONCURRENT DEVELOPER SESSIONS ({userCount.toLocaleString()})
            </span>
          </div>
          <p className="text-[11px] text-[#575249] mt-0.5">
            SPLIT: 33% VAR_A (540ms) // 33% VAR_B (1080ms) // 34% VAR_C (2810ms)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#8A8376] block">SESSIONS</span>
            <span className="text-xs font-bold text-[#151413]">{userCount.toLocaleString()} IDs</span>
          </div>

          <button
            onClick={handleRunSwarm}
            disabled={isRunning}
            className="pixel-btn pixel-btn-emerald py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "INGESTING..." : "RUN SWARM"}</span>
          </button>
        </div>
      </div>

      {/* Volume Slider Bar */}
      <div className="flex items-center gap-3 p-2 bg-[#EFECE3] border border-[#151413] shadow-[1.5px_1.5px_0px_#151413]">
        <span className="text-[10px] font-bold text-[#575249]">100</span>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={userCount}
          onChange={(e) => setUserCount(Number(e.target.value))}
          disabled={isRunning}
          aria-label="Developer volume"
          className="flex-1 accent-[#151413] cursor-pointer"
        />
        <span className="text-[10px] font-bold text-[#575249]">2,000</span>
      </div>

      {/* Hardware Dot Matrix */}
      <div className="p-3 bg-[#151413] border-2 border-[#151413] shadow-[2.5px_2.5px_0px_#151413] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono-code text-[#8A8376] border-b border-[#2D2A26] pb-1.5">
          <span>DOT MATRIX // {activeDotsCount} OF {userCount} IDENTITIES DISPATCHED</span>
          <div className="flex items-center gap-3">
            <span className="text-[#FBBF24]">VAR A (33%)</span>
            <span className="text-[#34D399] font-bold">VAR B (33%)</span>
            <span className="text-[#C084FC]">VAR C (34%)</span>
          </div>
        </div>

        <div className="dot-matrix py-0.5">
          {Array.from({ length: totalDisplayDots }).map((_, i) => {
            const isActive = i < activeDisplayDots;
            const dotColor = !isActive
              ? "bg-[#262422]"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 bg-[#EFECE3] border border-[#151413] shadow-[1.5px_1.5px_0px_#151413] space-y-0.5">
          <div className="font-bold text-[#151413] text-[11px]">[01] HACKER PERSONA</div>
          <p className="text-[#575249] text-[11px] leading-tight">
            Threshold: &lt;1500ms. Abandons high latency pipeline (Var C).
          </p>
        </div>

        <div className="p-2.5 bg-[#EFECE3] border border-[#151413] shadow-[1.5px_1.5px_0px_#151413] space-y-0.5">
          <div className="font-bold text-[#059669] text-[11px]">[02] ARCHITECT PERSONA</div>
          <p className="text-[#575249] text-[11px] leading-tight">
            Strict correctness. Verifies AST. Converts predominantly on Var B.
          </p>
        </div>

        <div className="p-2.5 bg-[#EFECE3] border border-[#151413] shadow-[1.5px_1.5px_0px_#151413] space-y-0.5">
          <div className="font-bold text-[#2563EB] text-[11px]">[03] PRAGMATIST PERSONA</div>
          <p className="text-[#575249] text-[11px] leading-tight">
            Runs code in isolated sandbox. Balances speed with reliability.
          </p>
        </div>
      </div>

      {/* Swarm Telemetry Ingestion Results */}
      {simulationResult && (
        <div className="pixel-card-emerald p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#065F46]">
            <span>INGESTED: {simulationResult.total_exposures} EXPOSURES // {simulationResult.total_conversions} CONVERSIONS</span>
            <span className="pixel-badge pixel-badge-emerald text-[10px]">
              COMMITTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 bg-white border border-[#151413] shadow-[1px_1px_0px_#151413]">
              <span className="text-[10px] text-[#8A8376] block">VAR A (fast_zero_shot)</span>
              <span className="text-base font-bold text-[#151413]">11.2% CONV</span>
              <span className="text-[10px] text-[#575249] block">56 / 500 | 540ms</span>
            </div>

            <div className="p-2.5 bg-white border-2 border-[#059669] shadow-[2px_2px_0px_#059669]">
              <span className="text-[10px] font-bold text-[#059669] block">VAR B (clustered_hybrid) [WINNER]</span>
              <span className="text-base font-bold text-[#059669]">24.8% CONV</span>
              <span className="text-[10px] text-[#059669] block font-semibold">124 / 500 | 1080ms</span>
            </div>

            <div className="p-2.5 bg-white border border-[#151413] shadow-[1px_1px_0px_#151413]">
              <span className="text-[10px] text-[#8A8376] block">VAR C (agentic_cot)</span>
              <span className="text-base font-bold text-[#151413]">16.5% CONV</span>
              <span className="text-[10px] text-[#575249] block">83 / 500 | 2810ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
