"use client";

import React, { useState, useEffect } from "react";
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
      <div className="pixel-box p-6 text-center text-xs text-[#7A756D] font-mono">
        &gt; LOADING BAYESIAN INFERENCE TELEMETRY...
      </div>
    );
  }

  const varA = report.variants.fast_zero_shot;
  const varB = report.variants.clustered_hybrid_rag;
  const varC = report.variants.agentic_self_reflection;

  const chartWidth = 700;
  const chartHeight = 160;
  const padding = 25;

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
    <div className="pixel-box p-4 space-y-3 font-mono select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#D3CDC1] pb-2.5">
        <div>
          <span className="text-[10px] text-[#7A756D]">BAYESIAN INFERENCE // 50,000 MCMC DRAWS</span>
          <div className="text-xs font-bold text-[#151413]">
            POSTERIOR CONVERGENCE: BETA(alpha + conv, beta + exp - conv)
          </div>
        </div>

        <div className="p-1.5 bg-[#EDEAE1] border border-[#151413] text-right">
          <span className="text-[10px] text-[#7A756D]">WIN PROB: </span>
          <span className="text-base font-bold text-[#059669]">{report.winner_win_probability_pct}%</span>
          <span className="text-[10px] text-[#059669] ml-2 font-bold">+{report.relative_lift_pct}% LIFT</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
        <div className="p-2.5 bg-[#EDEAE1] border border-[#D3CDC1]">
          <div className="flex justify-between text-[10px] text-[#7A756D]">
            <span>VAR A</span>
            <span>fast_zero_shot</span>
          </div>
          <div className="text-lg font-bold text-[#151413] mt-0.5">{varA.observed_conversion_rate}%</div>
          <div className="text-[10px] text-[#7A756D]">{varA.conversions} / {varA.exposures} | ~540ms</div>
          <div className="text-[10px] text-[#D97706] mt-1 font-bold">WIN: {varA.win_probability_pct || 0.1}%</div>
        </div>

        <div className="p-2.5 bg-white border-2 border-[#059669] shadow-[1.5px_1.5px_0px_#059669]">
          <div className="flex justify-between text-[10px] text-[#059669] font-bold">
            <span>VAR B [WINNER]</span>
            <span>clustered_hybrid</span>
          </div>
          <div className="text-lg font-bold text-[#059669] mt-0.5">{varB.observed_conversion_rate}%</div>
          <div className="text-[10px] text-[#059669]">{varB.conversions} / {varB.exposures} | ~1080ms</div>
          <div className="text-[10px] text-[#059669] mt-1 font-bold">WIN: {varB.win_probability_pct || 97.4}%</div>
        </div>

        <div className="p-2.5 bg-[#EDEAE1] border border-[#D3CDC1]">
          <div className="flex justify-between text-[10px] text-[#7A756D]">
            <span>VAR C</span>
            <span>agentic_cot</span>
          </div>
          <div className="text-lg font-bold text-[#151413] mt-0.5">{varC.observed_conversion_rate}%</div>
          <div className="text-[10px] text-[#7A756D]">{varC.conversions} / {varC.exposures} | ~2810ms</div>
          <div className="text-[10px] text-[#7C3AED] mt-1 font-bold">WIN: {varC.win_probability_pct || 2.5}%</div>
        </div>
      </div>

      {/* SVG Curve */}
      <div className="p-2.5 bg-[#151413] border border-[#151413] space-y-1">
        <div className="flex justify-between text-[9px] text-[#7A756D] border-b border-[#333] pb-1">
          <span>POSTERIOR DENSITY CURVES</span>
          <div className="flex gap-3">
            <span className="text-[#D97706]">VAR A (11.2%)</span>
            <span className="text-[#10B981] font-bold">VAR B (24.8%)</span>
            <span className="text-[#8B5CF6]">VAR C (16.5%)</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 select-none">
            {[5, 10, 15, 20, 25, 30, 35].map((pct) => {
              const x = padding + ((pct - 4) / 32) * (chartWidth - 2 * padding);
              return (
                <g key={pct}>
                  <line x1={x} y1={padding} x2={x} y2={chartHeight - padding} stroke="#2A2926" strokeDasharray="2 2" />
                  <text x={x} y={chartHeight - padding + 10} fontSize="8" fill="#7A756D" fontFamily="monospace" textAnchor="middle">
                    {pct}%
                  </text>
                </g>
              );
            })}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#444" strokeWidth="1" />
            <path d={getSvgPath("fast_zero_shot")} fill="none" stroke="#D97706" strokeWidth="1.5" />
            <path d={getSvgPath("agentic_self_reflection")} fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
            <path d={getSvgPath("clustered_hybrid_rag")} fill="none" stroke="#10B981" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* 1-Click Rollout */}
      <div className="p-2.5 bg-[#EDEAE1] border border-[#151413] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-[11px] font-bold text-[#151413]">
          ROLLOUT // SHIFT SPLIT FROM 33/33/34 TO 0/100/0 VIA ADMIN API
        </div>

        <button
          onClick={handlePromote}
          disabled={isPromoting || promotedSuccess}
          className={`pixel-btn-emerald py-1 px-3 text-xs font-bold ${
            promotedSuccess ? "bg-[#065F46] cursor-default" : ""
          }`}
        >
          {isPromoting ? "UPDATING..." : promotedSuccess ? "100% PROD ACTIVE" : "PROMOTE WINNER (VAR B)"}
        </button>
      </div>
    </div>
  );
};
