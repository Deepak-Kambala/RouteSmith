"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { FlagsmithEval, VariantType } from "@/lib/types";

interface HeaderProps {
  currentIdentity: string;
  flagsEval: FlagsmithEval | null;
  activeTab: "copilot" | "lab" | "custom_data";
  setActiveTab: (tab: "copilot" | "lab" | "custom_data") => void;
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

  const variantMeta: Record<VariantType, { label: string; latency: string; colorClass: string }> = {
    fast_zero_shot: {
      label: "Variant A (Zero-Shot)",
      latency: "540ms",
      colorClass: "bg-amber-50 text-amber-900 border-amber-200"
    },
    clustered_hybrid_rag: {
      label: isWinnerPromoted ? "Variant B (100% Production)" : "Variant B (Clustered Hybrid)",
      latency: isWinnerPromoted ? "Winner" : "1080ms",
      colorClass: isWinnerPromoted
        ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold"
        : "bg-blue-50 text-blue-900 border-blue-200"
    },
    agentic_self_reflection: {
      label: "Variant C (Agentic CoT)",
      latency: "2810ms",
      colorClass: "bg-purple-50 text-purple-900 border-purple-200"
    }
  };

  const currentVariant = variantMeta[variant];

  return (
    <header className="border-b border-[#E7E3DA] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif-display text-2xl font-bold tracking-tight text-[#181716]">
              RouteSmith
            </span>
            <span className="text-xs font-mono-code text-[#9C968B] uppercase">AI</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono-code bg-[#F3EFE8] text-[#6B665E] border border-[#E7E3DA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            Flagsmith A/B
          </span>
        </div>

        {/* Simplified 3-Tab Navigator */}
        <nav className="flex items-center bg-[#F3EFE8] p-1 rounded-full border border-[#E7E3DA] text-xs font-medium">
          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === "copilot"
                ? "bg-white text-[#181716] shadow-xs font-semibold"
                : "text-[#6B665E] hover:text-[#181716]"
            }`}
          >
            Copilot &amp; Sandbox
          </button>
          <button
            onClick={() => setActiveTab("lab")}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === "lab"
                ? "bg-white text-[#181716] shadow-xs font-semibold"
                : "text-[#6B665E] hover:text-[#181716]"
            }`}
          >
            Experiment Lab &amp; Rollout
          </button>
          <button
            onClick={() => setActiveTab("custom_data")}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === "custom_data"
                ? "bg-white text-[#181716] shadow-xs font-semibold"
                : "text-[#6B665E] hover:text-[#181716]"
            }`}
          >
            Custom Data
          </button>
        </nav>

        {/* Identity & Active Variant */}
        <div className="flex items-center gap-2">
          {/* Active Variant Pill */}
          <div
            className={`px-2.5 py-1 rounded-full border text-xs font-mono-code flex items-center gap-2 ${currentVariant.colorClass}`}
          >
            <span>{currentVariant.label}</span>
            <span className="keycap-tag text-[10px] py-0">{currentVariant.latency}</span>
          </div>

          {/* Reroll Button */}
          <button
            onClick={onNewSession}
            disabled={isSwitching}
            className="tactile-btn py-1 px-3 text-xs flex items-center gap-1.5 disabled:opacity-50"
            title="Generate a new session ID to test the 33/33/34 traffic split"
          >
            <RefreshCw className={`w-3 h-3 ${isSwitching ? "animate-spin" : ""}`} />
            <span>Reroll Identity</span>
          </button>
        </div>
      </div>
    </header>
  );
};
