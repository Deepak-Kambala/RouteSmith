"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, TrendingUp, SlidersHorizontal, ArrowRight } from "lucide-react";
import { BayesianReport } from "@/lib/types";
import { fetchBayesianStats, promoteWinner } from "@/lib/api";

interface BayesianAnalyticsProps {
  onWinnerPromoted: () => void;
  onEventTracked: (event: any) => void;
}

export const BayesianAnalytics: React.FC<BayesianAnalyticsProps> = ({ onWinnerPromoted, onEventTracked }) => {
  const [report, setReport] = useState<BayesianReport | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotedSuccess, setPromotedSuccess] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchBayesianStats();
      setReport(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromote = async () => {
    if (!report) return;
    setIsPromoting(true);
    try {
      await promoteWinner(report.recommended_winner);
      setPromotedSuccess(true);
      onWinnerPromoted();
      onEventTracked({
        event: "ADMIN_UPDATE",
        metric: "traffic_split_promoted",
        identifier: "flagsmith_admin_api",
        variant: "clustered_hybrid_rag",
        value: 100,
        timestamp: Date.now() / 1000
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsPromoting(false);
    }
  };

  if (!report) {
    return (
      <div className="clean-card p-8 text-center text-xs text-[#6B665E]">
        Calculating Bayesian posterior inference over MCMC distributions...
      </div>
    );
  }

  const varA = report.variants.fast_zero_shot;
  const varB = report.variants.clustered_hybrid_rag;
  const varC = report.variants.agentic_self_reflection;

  const chartWidth = 720;
  const chartHeight = 160;
  const padding = 30;

  const points = report.curve_points || [];
  const maxDensity = Math.max(
    ...points.map((p) => Math.max(p.fast_zero_shot || 0, p.clustered_hybrid_rag || 0, p.agentic_self_reflection || 0)),
    35
  );

  const getSvgPath = (variantKey: "fast_zero_shot" | "clustered_hybrid_rag" | "agentic_self_reflection") => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => {
        const x = padding + ((p.rate_pct - 4) / 32) * (chartWidth - 2 * padding);
        const y = chartHeight - padding - (p[variantKey] / maxDensity) * (chartHeight - 2 * padding);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="clean-card p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E3DA]">
        <div>
          <h2 className="text-base font-semibold text-[#181716] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#059669]" />
            <span>Bayesian Posterior Telemetry</span>
          </h2>
          <p className="text-xs text-[#6B665E] mt-0.5">
            50,000 Monte Carlo draws across Beta posterior conjugate distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
          <span className="text-xs text-[#065F46] font-medium">Win Probability:</span>
          <span className="text-sm font-bold text-[#059669]">{report.winner_win_probability_pct}%</span>
          <span className="text-xs text-[#059669] font-medium">+{report.relative_lift_pct}% Lift</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Variant A */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E3DA] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B665E]">
            <span>Variant A</span>
            <span className="keycap-tag">Fast Zero-Shot</span>
          </div>
          <div className="text-2xl font-bold text-[#181716]">{varA.observed_conversion_rate}%</div>
          <div className="text-xs text-[#9C968B]">{varA.conversions} / {varA.exposures} converted (~540ms)</div>
          <div className="text-xs font-medium text-[#D97706] pt-1">
            P(Winner): {varA.win_probability_pct || 0.1}%
          </div>
        </div>

        {/* Variant B */}
        <div className="p-4 rounded-xl bg-[#FFFFFF] border-2 border-[#059669] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#059669] font-semibold">
            <span>Variant B (Dominant)</span>
            <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px]">Winner</span>
          </div>
          <div className="text-2xl font-bold text-[#059669]">{varB.observed_conversion_rate}%</div>
          <div className="text-xs text-[#059669]">{varB.conversions} / {varB.exposures} converted (~1080ms)</div>
          <div className="text-xs font-semibold text-[#059669] pt-1">
            P(Winner): {varB.win_probability_pct || 97.4}%
          </div>
        </div>

        {/* Variant C */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E3DA] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B665E]">
            <span>Variant C</span>
            <span className="keycap-tag">Agentic CoT</span>
          </div>
          <div className="text-2xl font-bold text-[#181716]">{varC.observed_conversion_rate}%</div>
          <div className="text-xs text-[#9C968B]">{varC.conversions} / {varC.exposures} converted (~2810ms)</div>
          <div className="text-xs font-medium text-[#7C3AED] pt-1">
            P(Winner): {varC.win_probability_pct || 2.5}%
          </div>
        </div>
      </div>

      {/* Posterior Curve */}
      <div className="p-4 rounded-xl bg-[#181716] space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-xs font-mono-code text-[#9C968B] border-b border-[#2D2A26] pb-2">
          <span>Posterior Probability Density</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#FBBF24]">Variant A (11.2%)</span>
            <span className="text-[#34D399] font-semibold">Variant B (24.8%)</span>
            <span className="text-[#C084FC]">Variant C (16.5%)</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto py-1">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 select-none">
            {[5, 10, 15, 20, 25, 30, 35].map((pct) => {
              const x = padding + ((pct - 4) / 32) * (chartWidth - 2 * padding);
              return (
                <g key={pct}>
                  <line x1={x} y1={padding} x2={x} y2={chartHeight - padding} stroke="#2D2A26" strokeDasharray="3 3" />
                  <text x={x} y={chartHeight - padding + 12} fontSize="9" fill="#9C968B" fontFamily="monospace" textAnchor="middle">
                    {pct}%
                  </text>
                </g>
              );
            })}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#3D3A36" strokeWidth="1" />
            <path d={getSvgPath("fast_zero_shot")} fill="none" stroke="#FBBF24" strokeWidth="1.5" />
            <path d={getSvgPath("agentic_self_reflection")} fill="none" stroke="#C084FC" strokeWidth="1.5" />
            <path d={getSvgPath("clustered_hybrid_rag")} fill="none" stroke="#34D399" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* 1-Click Rollout Banner */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E3DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-[#181716] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#059669]" />
            <span>Automated Production Rollout</span>
          </div>
          <p className="text-xs text-[#6B665E] mt-0.5">
            Shift multivariate traffic from 33/33/34 to 100% Variant B in Flagsmith remote config.
          </p>
        </div>

        <button
          onClick={handlePromote}
          disabled={isPromoting || promotedSuccess}
          className={`tactile-btn tactile-btn-emerald py-2 px-5 text-xs font-semibold flex items-center gap-1.5 ${
            promotedSuccess ? "bg-[#065F46] cursor-default" : ""
          }`}
        >
          {promotedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Production Active</span>
            </>
          ) : (
            <>
              <span>{isPromoting ? "Deploying..." : "Promote Variant B (100%)"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
