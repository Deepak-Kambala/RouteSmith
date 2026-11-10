"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { FlagsmithEval, VariantType } from "@/lib/types";

interface HeaderProps {
  currentIdentity: string;
  flagsEval: FlagsmithEval | null;
  activeTab: "copilot" | "docs" | "simulator" | "analytics" | "rounds";
  setActiveTab: (tab: "copilot" | "docs" | "simulator" | "analytics" | "rounds") => void;
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
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 font-mono">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#151413]"></span>
          <span className="font-bold tracking-tight text-sm text-[#151413]">
            ROUTESMITH//AI
          </span>
          <span className="text-[10px] text-[#059669] font-bold px-1.5 py-0.2 border border-[#151413] bg-[#EDEAE1]">
            ONLINE
          </span>
        </div>

        {/* Simplified Segmented Tabs */}
        <nav className="flex items-center border-[1.5px] border-[#151413] bg-[#EDEAE1] p-0.5 shadow-[1.5px_1.5px_0px_#151413]">
          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "copilot" ? "bg-[#151413] text-[#F6F4EE]" : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            01//Copilot
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "docs" ? "bg-[#151413] text-[#F6F4EE]" : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            02//Custom Data
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "simulator" ? "bg-[#151413] text-[#F6F4EE]" : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            03//1500 Swarm
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "analytics" ? "bg-[#151413] text-[#F6F4EE]" : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            04//Bayesian
          </button>
          <button
            onClick={() => setActiveTab("rounds")}
            className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${
              activeTab === "rounds" ? "bg-[#151413] text-[#F6F4EE]" : "text-[#7A756D] hover:text-[#151413]"
            }`}
          >
            05//Lifecycle
          </button>
        </nav>

        {/* Identity & Active Variant */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-[#151413] bg-white">
            <span className={`font-bold ${currentVariant.color}`}>{currentVariant.name}</span>
            <span className="text-[#A39E94]">|</span>
            <span className="font-semibold">{currentVariant.latency}</span>
          </div>

          <div className="px-2 py-0.5 border border-[#D3CDC1] bg-[#EDEAE1] text-[#7A756D]">
            ID: <strong className="text-[#151413]">{currentIdentity}</strong>
          </div>

          <button
            onClick={onNewSession}
            disabled={isSwitching}
            className="pixel-btn py-0.5 px-2 text-[10px] flex items-center gap-1"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isSwitching ? "animate-spin" : ""}`} />
            <span>REROLL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
