"use client";

import React, { useState } from "react";
import { Zap, Play, CheckCircle2, Sliders, Activity } from "lucide-react";
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

    // Animate wave across the 1,500 dot matrix
    const totalSteps = 15;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveDotsCount(Math.min(userCount, Math.floor((step / totalSteps) * userCount)));
      if (step >= totalSteps) {
        clearInterval(interval);
      }
    }, 80);

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

  // Generate 500 preview dots for the visual matrix
  const totalDisplayDots = 500;
  const activeDisplayDots = Math.floor((activeDotsCount / userCount) * totalDisplayDots);

  return (
    <div className="pixel-box p-5 space-y-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D3CDC1] pb-3">
        <div>
          <span className="text-[10px] text-[#7A756D]">SWARM ENGINE // 1,500 PARALLEL IDENTITIES</span>
          <h2 className="text-base font-bold text-[#151413] mt-0.5">Synthetic Developer Traffic Matrix</h2>
          <div className="text-[11px] text-[#059669] font-semibold mt-0.5">
            Target Split: 33% Var A (540ms) | 33% Var B (1080ms) | 34% Var C (2810ms)
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-[#7A756D]">SWARM SIZE:</div>
            <div className="font-bold text-sm text-[#151413]">{userCount.toLocaleString()}</div>
          </div>
          <button
            onClick={handleRunSwarm}
            disabled={isRunning}
            className="pixel-btn-emerald py-2 px-3 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isRunning ? "INGESTING..." : "RUN SWARM"}</span>
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3 p-3 bg-[#EDEAE1] border border-[#D3CDC1]">
        <span className="text-[10px] font-bold text-[#7A756D]">100</span>
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
        <span className="text-[10px] font-bold text-[#7A756D]">2,000</span>
      </div>

      {/* 500-Dot Interactive Hardware Matrix */}
      <div className="p-3.5 bg-[#151413] border border-[#151413] space-y-2">
        <div className="flex items-center justify-between text-[10px] text-[#7A756D] border-b border-[#333] pb-1.5">
          <span>DOT MATRIX VISUALIZER // {activeDotsCount} / {userCount} IDENTITIES EVALUATED</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#D97706]"></span> VAR A</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10B981]"></span> VAR B</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#8B5CF6]"></span> VAR C</span>
          </div>
        </div>

        <div className="dot-matrix py-1">
          {Array.from({ length: totalDisplayDots }).map((_, i) => {
            const isActive = i < activeDisplayDots;
            // Modulo coloring based on 33/33/34 split
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

      {/* Persona Chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 bg-[#EDEAE1] border border-[#D3CDC1]">
          <div className="text-[10px] font-bold text-[#7A756D]">PERSONA 01</div>
          <div className="font-bold text-[#151413]">IMPATIENT HACKER</div>
          <div className="text-[10px] text-[#D97706] mt-0.5">Bounces if &gt;1500ms (Abandons Var C)</div>
        </div>
        <div className="p-2.5 bg-[#EDEAE1] border border-[#D3CDC1]">
          <div className="text-[10px] font-bold text-[#7A756D]">PERSONA 02</div>
          <div className="font-bold text-[#151413]">SENIOR ARCHITECT</div>
          <div className="text-[10px] text-[#059669] mt-0.5">Strict correctness (Converts on Var B)</div>
        </div>
        <div className="p-2.5 bg-[#EDEAE1] border border-[#D3CDC1]">
          <div className="text-[10px] font-bold text-[#7A756D]">PERSONA 03</div>
          <div className="font-bold text-[#151413]">PRAGMATIST BUILDER</div>
          <div className="text-[10px] text-[#2563EB] mt-0.5">Sandbox runner execution (Balanced)</div>
        </div>
      </div>

      {/* Live Ingestion Results */}
      {simulationResult && (
        <div className="p-3.5 bg-[#EDEAE1] border-2 border-[#059669] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#059669]">
              INGESTION COMPLETE: {simulationResult.total_exposures} EXPOSURES // {simulationResult.total_conversions} CONVERSIONS
            </span>
            <span className="ticker-badge bg-[#059669] text-white">COMMITTED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 bg-white border border-[#D3CDC1]">
              <div className="text-[#7A756D]">VAR A (fast_zero_shot)</div>
              <div className="font-bold text-sm text-[#151413]">11.2% RATE</div>
              <div className="text-[10px] text-[#7A756D] mt-0.5">56 / 500 | 540ms</div>
            </div>
            <div className="p-2.5 bg-white border-2 border-[#059669] shadow-[1px_1px_0px_#059669]">
              <div className="text-[#059669] font-bold">VAR B (clustered_hybrid) [LEADER]</div>
              <div className="font-bold text-sm text-[#059669]">24.8% RATE</div>
              <div className="text-[10px] text-[#059669] mt-0.5">124 / 500 | 1080ms</div>
            </div>
            <div className="p-2.5 bg-white border border-[#D3CDC1]">
              <div className="text-[#7A756D]">VAR C (agentic_cot)</div>
              <div className="font-bold text-sm text-[#151413]">16.5% RATE</div>
              <div className="text-[10px] text-[#7A756D] mt-0.5">83 / 500 | 2810ms (dropoff)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
