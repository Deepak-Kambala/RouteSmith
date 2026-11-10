"use client";

import React, { useState } from "react";
import { Zap } from "lucide-react";
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
    }, 70);

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
    <div className="pixel-box p-4 space-y-3 font-mono select-none">
      {/* Top Header & Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#D3CDC1] pb-2.5">
        <div>
          <span className="text-[10px] text-[#7A756D]">SWARM SIMULATOR // 1,500 PARALLEL SESSIONS</span>
          <div className="text-xs font-bold text-[#151413]">
            SPLIT: 33% VAR_A (540ms) | 33% VAR_B (1080ms) | 34% VAR_C (2810ms)
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#7A756D]">IDENTITIES: </span>
            <span className="font-bold text-xs text-[#151413]">{userCount.toLocaleString()}</span>
          </div>
          <button
            onClick={handleRunSwarm}
            disabled={isRunning}
            className="pixel-btn-emerald py-1 px-3 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            <span>{isRunning ? "INGESTING..." : "RUN SWARM"}</span>
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-2 p-2 bg-[#EDEAE1] border border-[#D3CDC1]">
        <span className="text-[9px] font-bold text-[#7A756D]">100</span>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={userCount}
          onChange={(e) => setUserCount(Number(e.target.value))}
          disabled={isRunning}
          aria-label="User volume"
          className="flex-1 accent-[#151413] cursor-pointer"
        />
        <span className="text-[9px] font-bold text-[#7A756D]">2,000</span>
      </div>

      {/* 500-Dot Hardware Matrix */}
      <div className="p-3 bg-[#151413] border border-[#151413] space-y-1.5">
        <div className="flex items-center justify-between text-[9px] text-[#7A756D] border-b border-[#333] pb-1">
          <span>DOT MATRIX // {activeDotsCount} / {userCount} IDENTITIES</span>
          <div className="flex items-center gap-3">
            <span className="text-[#D97706]">VAR A</span>
            <span className="text-[#10B981] font-bold">VAR B</span>
            <span className="text-[#8B5CF6]">VAR C</span>
          </div>
        </div>

        <div className="dot-matrix py-0.5">
          {Array.from({ length: totalDisplayDots }).map((_, i) => {
            const isActive = i < activeDisplayDots;
            const dotColor = !isActive
              ? "bg-[#2A2926]"
              : i % 3 === 0
              ? "bg-[#D97706]"
              : i % 3 === 1
              ? "bg-[#10B981]"
              : "bg-[#8B5CF6]";

            return <div key={i} className={`dot-unit ${dotColor}`} />;
          })}
        </div>
      </div>

      {/* Direct Persona Chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
        <div className="p-2 bg-[#EDEAE1] border border-[#D3CDC1]">
          <span className="font-bold text-[#151413]">HACKER</span>: &lt;1500ms (Abandons Var C)
        </div>
        <div className="p-2 bg-[#EDEAE1] border border-[#D3CDC1]">
          <span className="font-bold text-[#059669]">ARCHITECT</span>: Strict accuracy (Converts Var B)
        </div>
        <div className="p-2 bg-[#EDEAE1] border border-[#D3CDC1]">
          <span className="font-bold text-[#2563EB]">PRAGMATIST</span>: Sandbox tester (Balanced)
        </div>
      </div>

      {/* Ingestion Results */}
      {simulationResult && (
        <div className="p-3 bg-[#EDEAE1] border-2 border-[#059669] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#059669]">
            <span>INGESTED: {simulationResult.total_exposures} EXPOSURES // {simulationResult.total_conversions} CONVERSIONS</span>
            <span className="ticker-badge bg-[#059669] text-white">COMMITTED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 bg-white border border-[#D3CDC1]">
              <div className="text-[#7A756D] text-[10px]">VAR A (fast_zero_shot)</div>
              <div className="font-bold text-sm text-[#151413]">11.2% CONV</div>
              <div className="text-[10px] text-[#7A756D]">56 / 500 | 540ms</div>
            </div>
            <div className="p-2 bg-white border-2 border-[#059669]">
              <div className="text-[#059669] font-bold text-[10px]">VAR B (clustered_hybrid) [WINNER]</div>
              <div className="font-bold text-sm text-[#059669]">24.8% CONV</div>
              <div className="text-[10px] text-[#059669]">124 / 500 | 1080ms</div>
            </div>
            <div className="p-2 bg-white border border-[#D3CDC1]">
              <div className="text-[#7A756D] text-[10px]">VAR C (agentic_cot)</div>
              <div className="font-bold text-sm text-[#151413]">16.5% CONV</div>
              <div className="text-[10px] text-[#7A756D]">83 / 500 | 2810ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
