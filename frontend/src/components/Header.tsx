"use client";

import React from "react";
import { RefreshCw, Shield, Zap, Database } from "lucide-react";
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

  const variantLabels: Record<VariantType, { label: string; badge: string; colorClass: string }> = {
    fast_zero_shot: {
      label: "Variant A (fast_zero_shot)",
      badge: "540ms",
      colorClass: "bg-amber-50 text-amber-900 border-amber-200"
    },
    clustered_hybrid_rag: {
      label: isWinnerPromoted ? "Variant B (100% Production)" : "Variant B (clustered_hybrid_rag)",
      badge: isWinnerPromoted ? "Winner Locked" : "1080ms",
      colorClass: isWinnerPromoted ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold" : "bg-blue-50 text-blue-900 border-blue-200"
    },
    agentic_self_reflection: {
      label: "Variant C (agentic_self_reflection)",
      badge: "2810ms",
      colorClass: "bg-purple-50 text-purple-900 border-purple-200"
    }
  };

  const currentVariantInfo = variantLabels[variant];

  return (
    <header className="border-b border-[#E7E2D9] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-2xl font-bold tracking-tight text-[#181715]">
              RouteSmith
            </span>
            <span className="text-xs tracking-widest uppercase font-mono-code text-[#8E887E]">
              AI
            </span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono-code bg-[#F3EFEA] text-[#6B665E] border border-[#E7E2D9]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            Flagsmith SDK v6.5
          </span>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center bg-[#F3EFEA] p-1 rounded-full border border-[#E7E2D9] text-xs font-medium">
          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === "copilot"
                ? "bg-white text-[#181715] shadow-xs border border-[#E7E2D9] font-semibold"
                : "text-[#6B665E] hover:text-[#181715]"
            }`}
          >
            Copilot & Sandbox
          </button>
          <button
            onClick={() => setActiveTab("rounds")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === "rounds"
                ? "bg-white text-[#181715] shadow-xs border border-[#E7E2D9] font-semibold"
                : "text-[#6B665E] hover:text-[#181715]"
            }`}
          >
            4-Round Lifecycle
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === "simulator"
                ? "bg-white text-[#181715] shadow-xs border border-[#E7E2D9] font-semibold"
                : "text-[#6B665E] hover:text-[#181715]"
            }`}
          >
            Swarm Simulator (1,500)
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === "analytics"
                ? "bg-white text-[#181715] shadow-xs border border-[#E7E2D9] font-semibold"
                : "text-[#6B665E] hover:text-[#181715]"
            }`}
          >
            Bayesian Telemetry
          </button>
        </nav>

        {/* Right: Active Identity HUD & New Session Button */}
        <div className="flex items-center gap-2">
          {/* Identity Chip */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E7E2D9] text-xs font-mono-code text-[#44403C]">
            <span className="text-[#8E887E]">id:</span>
            <span className="font-semibold text-[#181715]">{currentIdentity}</span>
          </div>

          {/* Active Variant Pill */}
          <div
            className={`px-2.5 py-1 rounded-md border text-xs font-mono-code flex items-center gap-2 transition-all ${currentVariantInfo.colorClass}`}
          >
            <span>{currentVariantInfo.label}</span>
            <span className="keycap-badge text-[10px] py-0">{currentVariantInfo.badge}</span>
          </div>

          {/* New User Session Switcher Button */}
          <button
            onClick={onNewSession}
            disabled={isSwitching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181715] hover:bg-[#2D2A26] text-white text-xs font-medium transition-all shadow-xs active:translate-y-px disabled:opacity-50"
            title="Generate a fresh UUID identity to test 33/33/34 traffic partitioning"
          >
            <RefreshCw className={`w-3 h-3 ${isSwitching ? "animate-spin" : ""}`} />
            <span>New Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};

