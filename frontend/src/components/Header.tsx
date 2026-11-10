"use client";

import React from "react";
import { RefreshCw, Radio } from "lucide-react";
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

  const variantMeta: Record<VariantType, { label: string; latency: string; badgeClass: string }> = {
    fast_zero_shot: {
      label: "VAR A // ZERO-SHOT",
      latency: "540ms",
      badgeClass: "pixel-badge-amber"
    },
    clustered_hybrid_rag: {
      label: isWinnerPromoted ? "VAR B // 100% PRODUCTION" : "VAR B // CLUSTERED HYBRID",
      latency: isWinnerPromoted ? "WINNER" : "1080ms",
      badgeClass: "pixel-badge-emerald"
    },
    agentic_self_reflection: {
      label: "VAR C // AGENTIC COT",
      latency: "2810ms",
      badgeClass: "pixel-badge-purple"
    }
  };

  const currentVariant = variantMeta[variant];

  return (
    <header className="border-b-2 border-[#151413] bg-[#F8F6F0] sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-pixel-display text-lg font-bold tracking-tight text-[#151413] bg-[#151413] text-[#F8F6F0] px-2 py-0.5 shadow-[2px_2px_0px_#059669]">
              ROUTESMITH
            </span>
            <span className="text-[11px] font-bold tracking-widest text-[#575249]">
              [AI]
            </span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-[#EFECE3] border border-[#151413] shadow-[1px_1px_0px_#151413]">
            <Radio className="w-3 h-3 text-[#059669] animate-pulse" />
            <span>FLAGSMITH A/B</span>
          </div>
        </div>

        {/* Pixel Tab Switcher */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#EFECE3] border-2 border-[#151413] shadow-[2px_2px_0px_#151413]">
          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-3 py-1 text-xs font-bold transition-all ${
              activeTab === "copilot"
                ? "bg-[#151413] text-[#F8F6F0] shadow-[1.5px_1.5px_0px_#059669]"
                : "bg-transparent text-[#575249] hover:text-[#151413] hover:bg-white"
            }`}
          >
            [01] COPILOT
          </button>
          <button
            onClick={() => setActiveTab("lab")}
            className={`px-3 py-1 text-xs font-bold transition-all ${
              activeTab === "lab"
                ? "bg-[#151413] text-[#F8F6F0] shadow-[1.5px_1.5px_0px_#059669]"
                : "bg-transparent text-[#575249] hover:text-[#151413] hover:bg-white"
            }`}
          >
            [02] EXPERIMENT LAB
          </button>
          <button
            onClick={() => setActiveTab("custom_data")}
            className={`px-3 py-1 text-xs font-bold transition-all ${
              activeTab === "custom_data"
                ? "bg-[#151413] text-[#F8F6F0] shadow-[1.5px_1.5px_0px_#059669]"
                : "bg-transparent text-[#575249] hover:text-[#151413] hover:bg-white"
            }`}
          >
            [03] CUSTOM DATA
          </button>
        </nav>

        {/* Identity & Active Variant */}
        <div className="flex items-center gap-2">
          {/* Active Variant Pill */}
          <div className={`pixel-badge ${currentVariant.badgeClass}`}>
            <span>{currentVariant.label}</span>
            <span className="text-[9px] px-1 bg-white/70 border border-current ml-1">
              {currentVariant.latency}
            </span>
          </div>

          {/* Reroll Button */}
          <button
            onClick={onNewSession}
            disabled={isSwitching}
            className="pixel-btn text-xs py-1 px-2.5 flex items-center gap-1.5 disabled:opacity-50"
            title="Generate a new session ID to test multivariate flag hash routing"
          >
            <RefreshCw className={`w-3 h-3 ${isSwitching ? "animate-spin" : ""}`} />
            <span>REROLL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
