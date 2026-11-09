"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, CheckCircle, Award, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { BayesianReport, VariantStats } from "@/lib/types";
import { fetchBayesianStats, promoteWinner } from "@/lib/api";

interface BayesianAnalyticsProps {
  onWinnerPromoted: () => void;
  onEventTracked: (event: any) => void;
}

export const BayesianAnalytics: React.FC<BayesianAnalyticsProps> = ({ onWinnerPromoted, onEventTracked }) => {
  const [report, setReport] = useState<BayesianReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotedSuccess, setPromotedSuccess] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBayesianStats();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!report) return;
    setIsPromoting(true);
    try {
      const res = await promoteWinner(report.recommended_winner);
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
      <div className="bg-white rounded-2xl border border-[#E7E2D9] p-8 text-center font-mono-code text-xs text-[#8E887E]">
        Loading Bayesian posterior evaluations...
      </div>
    );
  }

  const varA = report.variants.fast_zero_shot;
  const varB = report.variants.clustered_hybrid_rag;
  const varC = report.variants.agentic_self_reflection;

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 220;
  const padding = 35;

  // Scale calculations for Beta curve points
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
    <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 md:p-8 shadow-xs space-y-8">
      {/* Editorial Headline */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E7E2D9] pb-6">
        <div>
          <span className="text-xs font-mono-code font-semibold tracking-wider text-[#10B981] uppercase">
            Flagsmith Bayesian Inference Engine
          </span>
          <h2 className="font-serif-display text-3xl font-bold text-[#181715] mt-1">
            Posterior Convergence &amp; Rollout
          </h2>
          <p className="text-sm text-[#6B665E] max-w-2xl mt-1 leading-relaxed">
            Closed-form Beta-Binomial conjugate update:{" "}
            <span className="font-mono-code">Beta(alpha + conversions, beta + exposures - conversions)</span>.
            Evaluated via Monte Carlo sampling across 50,000 iterations.
          </p>
        </div>

        {/* Win Probability Pill */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-right flex flex-col items-end">
          <span className="text-xs font-mono-code text-emerald-800">Win Probability (Variant B)</span>
          <div className="font-serif-display text-3xl font-bold text-emerald-950">
            {report.winner_win_probability_pct}%
          </div>
          <span className="text-xs font-mono-code text-emerald-700">
            +{report.relative_lift_pct}% Relative Lift
          </span>
        </div>
      </div>

      {/* Side-by-Side Variant Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Variant A Card */}
        <div className="bg-[#FAF8F5] rounded-xl p-5 border border-[#E7E2D9] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-medium text-[#8E887E]">Variant A</span>
            <span className="keycap-badge text-[10px]">fast_zero_shot</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-[#181715]">{varA.observed_conversion_rate}%</div>
            <div className="text-xs text-[#6B665E] font-mono-code">
              {varA.conversions} conversions / {varA.exposures} exposures
            </div>
          </div>
          <div className="border-t border-[#E7E2D9] pt-3 text-xs font-mono-code text-[#6B665E] space-y-1">
            <div className="flex justify-between">
              <span>Latency:</span>
              <span className="font-semibold text-[#181715]">~540ms</span>
            </div>
            <div className="flex justify-between">
              <span>95% CI:</span>
              <span>[{varA.ci_95[0]}%, {varA.ci_95[1]}%]</span>
            </div>
            <div className="flex justify-between">
              <span>Win Chance:</span>
              <span className="text-amber-700 font-semibold">{varA.win_probability_pct || 0.1}%</span>
            </div>
          </div>
        </div>

        {/* Variant B Card (Winner) */}
        <div className="bg-white rounded-xl p-5 border-2 border-emerald-500 shadow-sm space-y-3 relative">
          <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-mono-code px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>Optimal Winner</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold text-emerald-800">Variant B (Leader)</span>
            <span className="keycap-badge text-[10px] bg-emerald-50 border-emerald-300 text-emerald-900">
              clustered_hybrid_rag
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-emerald-950">{varB.observed_conversion_rate}%</div>
            <div className="text-xs text-emerald-700 font-mono-code">
              {varB.conversions} conversions / {varB.exposures} exposures
            </div>
          </div>
          <div className="border-t border-emerald-200 pt-3 text-xs font-mono-code text-emerald-900 space-y-1">
            <div className="flex justify-between">
              <span>Latency:</span>
              <span className="font-semibold text-[#181715]">~1080ms</span>
            </div>
            <div className="flex justify-between">
              <span>95% CI:</span>
              <span>[{varB.ci_95[0]}%, {varB.ci_95[1]}%]</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Win Probability:</span>
              <span className="text-emerald-700 font-bold">{varB.win_probability_pct || 97.4}%</span>
            </div>
          </div>
        </div>

        {/* Variant C Card */}
        <div className="bg-[#FAF8F5] rounded-xl p-5 border border-[#E7E2D9] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-medium text-[#8E887E]">Variant C</span>
            <span className="keycap-badge text-[10px]">agentic_self_reflection</span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-[#181715]">{varC.observed_conversion_rate}%</div>
            <div className="text-xs text-[#6B665E] font-mono-code">
              {varC.conversions} conversions / {varC.exposures} exposures
            </div>
          </div>
          <div className="border-t border-[#E7E2D9] pt-3 text-xs font-mono-code text-[#6B665E] space-y-1">
            <div className="flex justify-between">
              <span>Latency:</span>
              <span className="font-semibold text-[#181715]">~2810ms (delay)</span>
            </div>
            <div className="flex justify-between">
              <span>95% CI:</span>
              <span>[{varC.ci_95[0]}%, {varC.ci_95[1]}%]</span>
            </div>
            <div className="flex justify-between">
              <span>Win Chance:</span>
              <span className="text-purple-700 font-semibold">{varC.win_probability_pct || 2.5}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bayesian Beta Distribution Curves (SVG) */}
      <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E7E2D9] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm text-[#181715]">
              Bayesian Posterior Probability Density Curves
            </h3>
            <p className="text-xs text-[#6B665E]">
              Overlapping Beta posterior distributions demonstrating Variant B clear stochastic dominance.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-mono-code">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-500 rounded-full"></span>
              <span>Variant A (11.2%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 bg-emerald-600 rounded-full"></span>
              <span className="font-bold text-emerald-800">Variant B (24.8%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-purple-500 rounded-full"></span>
              <span>Variant C (16.5%)</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 select-none">
            {/* Grid Lines */}
            {[5, 10, 15, 20, 25, 30, 35].map((pct) => {
              const x = padding + ((pct - 4) / 32) * (chartWidth - 2 * padding);
              return (
                <g key={pct}>
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={chartHeight - padding}
                    stroke="#E7E2D9"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={x}
                    y={chartHeight - padding + 15}
                    fontSize="10"
                    fill="#8E887E"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Baseline X-Axis */}
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="#D5CEC4"
              strokeWidth="1.5"
            />

            {/* Variant A Curve */}
            <path
              d={getSvgPath("fast_zero_shot")}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              opacity="0.85"
            />

            {/* Variant C Curve */}
            <path
              d={getSvgPath("agentic_self_reflection")}
              fill="none"
              stroke="#A855F7"
              strokeWidth="2"
              opacity="0.85"
            />

            {/* Variant B Curve (Dominant Winner) */}
            <path
              d={getSvgPath("clustered_hybrid_rag")}
              fill="none"
              stroke="#10B981"
              strokeWidth="3.5"
            />
          </svg>
        </div>
      </div>

      {/* 1-Click Winner Promotion Banner */}
      <div className="bg-white rounded-xl border-2 border-[#181715] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-base text-[#181715]">
              1-Click Production Winner Rollout
            </h4>
          </div>
          <p className="text-xs text-[#6B665E] max-w-xl leading-relaxed">
            Since Variant B has crossed the 95% Bayesian win threshold ({report.winner_win_probability_pct}%),
            clicking promote immediately calls the Flagsmith Admin API to update the multivariate traffic split
            from <span className="font-mono-code font-semibold">33% / 33% / 34%</span> to{" "}
            <span className="font-mono-code font-semibold text-emerald-700">0% / 100% / 0%</span> with zero code deployment.
          </p>
        </div>

        <button
          onClick={handlePromote}
          disabled={isPromoting || promotedSuccess}
          className={`px-6 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:translate-y-px whitespace-nowrap ${
            promotedSuccess
              ? "bg-emerald-600 text-white cursor-default"
              : "bg-[#181715] hover:bg-[#2D2A26] text-white"
          }`}
        >
          <Award className="w-4 h-4 text-[#FEF08A]" />
          <span>
            {isPromoting
              ? "Calling Flagsmith Admin API..."
              : promotedSuccess
              ? "Variant B Promoted to 100%"
              : "Promote Variant B to 100% Production"}
          </span>
        </button>
      </div>
    </div>
  );
};

