"use client";

import React from "react";
import { RefreshCw, Terminal, Cpu } from "lucide-react";
import { FlagsmithEval, VariantType } from "@/lib/types";

interface HeaderProps {
  currentIdentity: string;
  flagsEval: FlagsmithEval | null;
  activeTab: "copilot" | "rounds" | "simulator" | "analytics";
  setActiveTab: (tab: "copilot" | "rounds" | "simulator" | "analytics") => void;
  onNewSession: () => void;
  isSwitching: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentIdentity,
  flagsEval,
  activeTab,
  setActiveTab,
  onNewSession,
  isSwitching,
}) => {
  const variant = flagsEval?.strategy || "clustered_hybrid_rag";
  const weights = flagsEval?.traffic_weights || { fast_zero_shot: 33, clustered_hybrid_rag: 33, agentic_self_reflection: 34 };
  const isWinnerPromoted = weights.clustered_hybrid_rag === 100;

  const variantLabels: Record<VariantType, { name: string; latency: string; color: string }> = {
    fast_zero_shot: { name: "VAR_A: ZERO_SHOT", latency: "540ms", color: "text-[#D97706]" },
    clustered_hybrid_rag: {
      name: isWinnerPromoted ? "VAR_B: 100% PROD" : "VAR_B: HYBRID_RAG",
      latency: isWinnerPromoted ? "WINNER" : "1080ms",
      color: "text-[#059669]"
    },
    agentic_self_reflection: { name: "VAR_C: AGENTIC_COT", latency: "2810ms", color: "text-[#7C3AED]" }
  };

  const currentVariant = variantLabels[variant];

  return (
    <header className="border-b-[1.5px] border-[#151413] bg-[#F6F4EE] px-4 lg:px-8 py-2.5 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#151413]"></span>
            <span className="font-bold tracking-tight text-sm text-[#151413]">
              ROUTESMITH//AI
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-[#151413] bg-[#EDEAE1] text-[10px] text-[#151413]">
            <span className="led-indicator led-green"></span>
            <span>FLAGSMITH CONTROL PLANE</span>
          </div>
        </div>

        {/* View Mode Switcher (Hardware Segmented Bar) */}
        <nav className="flex items-center border-[1.5px] border-[#151413] bg-[#EDEAE1] p-0.5 shadow-[1.5px_1.5px_0px_#151413]">
          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "copilot"
                ? "bg-[#151413] text-[#F6F4EE]"
                : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            01//Copilot
          </button>
          <button
            onClick={() => setActiveTab("rounds")}
            className={`px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "rounds"
                ? "bg-[#151413] text-[#F6F4EE]"
                : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            02//Lifecycle
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "simulator"
                ? "bg-[#151413] text-[#F6F4EE]"
                : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            03//1500-Swarm
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "analytics"
                ? "bg-[#151413] text-[#F6F4EE]"
                : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            04//Bayesian
          </button>
        </nav>

        {/* Identity & Active Variant HUD */}
        <div className="flex items-center gap-2">
          {/* Active Variant */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-[#151413] bg-[#FFFFFF] text-[10px]">
            <span className={`font-bold ${currentVariant.color}`}>{currentVariant.name}</span>
            <span className="text-[#A39E94]">|</span>
            <span className="font-semibold text-[#151413]">{currentVariant.latency}</span>
          </div>

          {/* Identity Tag */}
          <div className="px-2 py-1 border border-[#D3CDC1] bg-[#EDEAE1] text-[10px] text-[#7A756D]">
            ID: <span className="text-[#151413] font-bold">{currentIdentity}</span>
          </div>

          {/* Reroll Button */}
          <button
            onClick={onNewSession}
            disabled={isSwitching}
            className="pixel-btn flex items-center gap-1 py-1 px-2.5"
            title="Evaluate fresh identity across 33/33/34 split"
          >
            <RefreshCw className={`w-3 h-3 ${isSwitching ? "animate-spin" : ""}`} />
            <span>REROLL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
