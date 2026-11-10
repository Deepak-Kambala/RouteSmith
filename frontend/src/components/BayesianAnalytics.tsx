"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
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
      <div className="pixel-card p-6 text-center text-xs text-[#575249]">
        &gt; COMPUTING BAYESIAN POSTERIOR DISTRIBUTIONS...
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
    <div className="pixel-card p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#151413]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-pixel-display text-xs font-bold bg-[#151413] text-[#F8F6F0] px-2 py-0.5">
              BAYESIAN INFERENCE
            </span>
            <span className="text-xs font-bold text-[#151413]">
              BETA POSTERIOR DENSITY // 50,000 MCMC DRAWS
            </span>
          </div>
          <p className="text-[11px] text-[#575249] mt-0.5">
            Closed-form Beta conjugate updates: Beta(alpha + conversions, beta + non_conversions)
          </p>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#D1FAE5] border-2 border-[#059669] shadow-[2px_2px_0px_#059669] text-xs font-bold text-[#065F46]">
          <span>WIN PROB: {report.winner_win_probability_pct}%</span>
          <span className="text-[#059669]">+{report.relative_lift_pct}% LIFT</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Variant A */}
        <div className="p-3 bg-[#EFECE3] border border-[#151413] shadow-[1.5px_1.5px_0px_#151413] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#151413]">VAR A</span>
            <span className="pixel-badge pixel-badge-amber text-[9px]">ZERO-SHOT</span>
          </div>
          <div className="text-xl font-bold text-[#151413]">{varA.observed_conversion_rate}%</div>
          <div className="text-[10px] text-[#575249]">{varA.conversions} / {varA.exposures} | ~540ms</div>
          <div className="text-[11px] font-bold text-[#D97706] pt-0.5">
            P(WIN): {varA.win_probability_pct || 0.1}%
          </div>
        </div>

        {/* Variant B */}
        <div className="p-3 bg-white border-2 border-[#059669] shadow-[2.5px_2.5px_0px_#059669] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#059669]">VAR B [WINNER]</span>
            <span className="pixel-badge pixel-badge-emerald text-[9px]">HYBRID</span>
          </div>
          <div className="text-xl font-bold text-[#059669]">{varB.observed_conversion_rate}%</div>
          <div className="text-[10px] text-[#059669] font-medium">{varB.conversions} / {varB.exposures} | ~1080ms</div>
          <div className="text-[11px] font-bold text-[#059669] pt-0.5">
            P(WIN): {varB.win_probability_pct || 97.4}%
          </div>
        </div>

        {/* Variant C */}
        <div className="p-3 bg-[#EFECE3] border border-[#151413] shadow-[1.5px_1.5px_0px_#151413] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#151413]">VAR C</span>
            <span className="pixel-badge pixel-badge-purple text-[9px]">AGENTIC COT</span>
          </div>
          <div className="text-xl font-bold text-[#151413]">{varC.observed_conversion_rate}%</div>
          <div className="text-[10px] text-[#575249]">{varC.conversions} / {varC.exposures} | ~2810ms</div>
          <div className="text-[11px] font-bold text-[#7C3AED] pt-0.5">
            P(WIN): {varC.win_probability_pct || 2.5}%
          </div>
        </div>
      </div>

      {/* Posterior Curve inside Pixel Box */}
      <div className="p-3 bg-[#151413] border-2 border-[#151413] shadow-[2.5px_2.5px_0px_#151413] space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono-code text-[#8A8376] border-b border-[#2D2A26] pb-1.5">
          <span>POSTERIOR PROBABILITY CURVE</span>
          <div className="flex items-center gap-3">
            <span className="text-[#FBBF24]">VAR A (11.2%)</span>
            <span className="text-[#34D399] font-bold">VAR B (24.8%)</span>
            <span className="text-[#C084FC]">VAR C (16.5%)</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto py-1">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 select-none">
            {[5, 10, 15, 20, 25, 30, 35].map((pct) => {
              const x = padding + ((pct - 4) / 32) * (chartWidth - 2 * padding);
              return (
                <g key={pct}>
                  <line x1={x} y1={padding} x2={x} y2={chartHeight - padding} stroke="#2D2A26" strokeDasharray="3 3" />
                  <text x={x} y={chartHeight - padding + 12} fontSize="9" fill="#8A8376" fontFamily="monospace" textAnchor="middle">
                    {pct}%
                  </text>
                </g>
              );
            })}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#3D3A36" strokeWidth="1.5" />
            <path d={getSvgPath("fast_zero_shot")} fill="none" stroke="#FBBF24" strokeWidth="1.5" />
            <path d={getSvgPath("agentic_self_reflection")} fill="none" stroke="#C084FC" strokeWidth="1.5" />
            <path d={getSvgPath("clustered_hybrid_rag")} fill="none" stroke="#34D399" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* 1-Click Rollout Banner */}
      <div className="p-3 bg-[#EFECE3] border-2 border-[#151413] shadow-[2.5px_2.5px_0px_#151413] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-[#151413]">
            AUTOMATED ROLLOUT // SHIFT TRAFFIC TO 100% VARIANT B
          </div>
          <p className="text-[11px] text-[#575249] mt-0.5">
            Mutates Flagsmith remote multivariate weights via Admin API without code redeployment.
          </p>
        </div>

        <button
          onClick={handlePromote}
          disabled={isPromoting || promotedSuccess}
          className={`pixel-btn pixel-btn-emerald py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 ${
            promotedSuccess ? "bg-[#065F46] cursor-default" : ""
          }`}
        >
          {promotedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>100% PRODUCTION ACTIVE</span>
            </>
          ) : (
            <>
              <span>{isPromoting ? "DEPLOYING..." : "PROMOTE WINNER (VAR B)"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
