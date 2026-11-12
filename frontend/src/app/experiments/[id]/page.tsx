"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { fetchExperimentById } from "@/lib/api";
import { Experiment } from "@/types";
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  GitBranch,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Percent,
  Users,
  Code2,
  FileCode,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sliders,
} from "lucide-react";

export default function ExperimentDetailsPage() {
  const params = useParams();
  const experimentId = (params?.id as string) || "exp_signup_v2";

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "variants" | "participants" | "metrics" | "implementation" | "insights"
  >("overview");
  const [status, setStatus] = useState<"running" | "paused" | "concluded">("running");

  useEffect(() => {
    loadExperiment();
  }, [experimentId]);

  const loadExperiment = async () => {
    const data = await fetchExperimentById(experimentId);
    if (data) {
      setExperiment(data);
      setStatus(data.status as any);
    }
  };

  if (!experiment) {
    return (
      <AppShell>
        <div className="dev-card p-12 text-center text-xs text-[#64748B]">
          Loading experiment telemetry and Bayesian posteriors...
        </div>
      </AppShell>
    );
  }

  const control = experiment.variants.find((v) => v.type === "control") || experiment.variants[0];
  const treatment = experiment.variants.find((v) => v.type === "treatment") || experiment.variants[1];

  const handleToggleStatus = (newStatus: "running" | "paused" | "concluded") => {
    setStatus(newStatus);
    setExperiment({ ...experiment, status: newStatus });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div className="space-y-1">
            <Link
              href="/experiments"
              className="text-xs text-[#64748B] hover:text-[#111827] flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Experiments</span>
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-[650] tracking-tight text-[#111827]">
                {experiment.name}
              </h1>
              <span
                className={`status-badge ${
                  status === "running"
                    ? "status-badge-active"
                    : status === "paused"
                    ? "status-badge-paused"
                    : "status-badge-concluded"
                }`}
              >
                {status === "running" && <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]"></span>}
                <span className="capitalize">{status}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#64748B] font-mono-code">
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>{experiment.repository_name}</span>
              </div>
              <span>&bull;</span>
              <span>Flag: <code className="text-[#3867F5] font-semibold">{experiment.feature_flag_key}</code></span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {status === "running" ? (
              <button
                onClick={() => handleToggleStatus("paused")}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5 text-[#D99725]" />
                <span>Pause Traffic</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus("running")}
                className="btn-primary text-xs flex items-center gap-1.5 bg-[#16A36A] hover:bg-[#15803D]"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume Traffic</span>
              </button>
            )}

            <button
              onClick={() => handleToggleStatus("concluded")}
              className="btn-secondary text-xs flex items-center gap-1.5 text-[#DC5555] hover:bg-[#FEF2F2]"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Conclude</span>
            </button>
          </div>
        </div>

        {/* 6 Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[#E5E7EB] text-xs font-medium">
          {[
            { id: "overview", label: "Overview" },
            { id: "variants", label: "Variants" },
            { id: "participants", label: "Participants" },
            { id: "metrics", label: "Metrics & Stats" },
            { id: "implementation", label: "Implementation" },
            { id: "insights", label: "AI Insights" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-[#3867F5] text-[#1E40AF] font-semibold"
                  : "border-transparent text-[#64748B] hover:text-[#111827]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Hypothesis Card */}
            <div className="dev-card p-5 space-y-2">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Hypothesis
              </span>
              <p className="text-sm text-[#111827] leading-relaxed font-medium">
                &ldquo;{experiment.hypothesis}&rdquo;
              </p>
            </div>

            {/* Side-by-side Conversion Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Control */}
              <div className="dev-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#64748B]">Variant A (Control)</span>
                  <span className="text-xs font-mono-code bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    {control.weight}%
                  </span>
                </div>
                <div className="text-[28px] font-[650] text-[#111827]">
                  {control.conversion_rate}%
                </div>
                <div className="text-xs text-[#64748B] font-mono-code">
                  {control.conversions.toLocaleString()} / {control.exposures.toLocaleString()} converted
                </div>
              </div>

              {/* Treatment */}
              <div className="dev-card p-5 space-y-2 border-2 border-[#16A36A] bg-[#F0FDF4]/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#16A36A]">Variant B (Treatment) [Winner]</span>
                  <span className="text-xs font-mono-code bg-[#DCFCE7] text-[#16A36A] px-2 py-0.5 rounded border border-[#86EFAC] font-semibold">
                    {treatment.weight}%
                  </span>
                </div>
                <div className="text-[28px] font-[650] text-[#16A36A]">
                  {treatment.conversion_rate}%
                </div>
                <div className="text-xs text-[#16A36A] font-mono-code">
                  {treatment.conversions.toLocaleString()} / {treatment.exposures.toLocaleString()} converted
                  {experiment.metrics.relative_lift && (
                    <strong className="ml-1.5">
                      (+{experiment.metrics.relative_lift.toFixed(1)}% lift)
                    </strong>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VARIANTS */}
        {activeTab === "variants" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dev-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="text-sm font-semibold text-[#111827]">{control.name}</span>
                <span className="text-xs font-mono-code text-[#64748B]">6 Fields</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">{control.description}</p>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-mono-code space-y-1">
                <div>- Full Name (required)</div>
                <div>- Work Email (required)</div>
                <div>- Password (required)</div>
                <div>- Company Name (required)</div>
                <div>- Company Size (dropdown)</div>
                <div>- Job Role (dropdown)</div>
              </div>
            </div>

            <div className="dev-card p-5 space-y-3 border-2 border-[#3867F5]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="text-sm font-semibold text-[#1E40AF]">{treatment.name}</span>
                <span className="text-xs font-mono-code text-[#3867F5] font-semibold">3 Fields</span>
              </div>
              <p className="text-xs text-[#1E40AF] leading-relaxed">{treatment.description}</p>
              <div className="p-3 rounded-lg bg-[#EFF4FF] border border-[#BFDBFE] text-xs font-mono-code space-y-1 text-[#1E40AF]">
                <div>- Full Name (required)</div>
                <div>- Work Email (required)</div>
                <div>- Password (required)</div>
                <div className="text-[#94A3B8] italic pt-1">// Company &amp; role enriched asynchronously</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PARTICIPANTS */}
        {activeTab === "participants" && (
          <div className="dev-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Audience Allocation Registry</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Privacy-conscious pseudonymous identifier hashing via Flagsmith deterministic murmur3
                </p>
              </div>
              <span className="text-xs font-mono-code text-[#64748B]">
                {experiment.total_participants.toLocaleString()} Total Evaluated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                    <th className="py-2.5 px-4">Participant ID</th>
                    <th className="py-2.5 px-4">Assigned Variant</th>
                    <th className="py-2.5 px-4">Exposure Timestamp</th>
                    <th className="py-2.5 px-4">Conversion Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] font-mono-code text-[11px]">
                  {[
                    { id: "usr_a89f21", variant: "Variant B", time: "2m ago", converted: true },
                    { id: "usr_7b4c90", variant: "Variant A", time: "4m ago", converted: false },
                    { id: "usr_3e11d8", variant: "Variant B", time: "6m ago", converted: true },
                    { id: "usr_f04a77", variant: "Variant A", time: "9m ago", converted: true },
                    { id: "usr_9c82b1", variant: "Variant B", time: "11m ago", converted: true },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2 px-4 font-semibold text-[#111827]">{row.id}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.variant === "Variant B"
                              ? "bg-[#DCFCE7] text-[#16A36A]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {row.variant}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-[#64748B]">{row.time}</td>
                      <td className="py-2 px-4">
                        {row.converted ? (
                          <span className="text-[#16A36A] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Converted</span>
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">No Conversion</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: METRICS & STATS */}
        {activeTab === "metrics" && (
          <div className="dev-card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#111827]">Statistical Hypothesis Test</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Two-sample Z-test and Bayesian conjugate Beta posterior distributions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <span className="text-xs text-[#64748B]">p-Value</span>
                <div className="text-2xl font-bold font-mono-code text-[#16A36A]">
                  p &lt; 0.001
                </div>
                <div className="text-[11px] text-[#64748B]">Statistically Significant (&alpha; = 0.05)</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <span className="text-xs text-[#64748B]">95% Confidence Interval</span>
                <div className="text-2xl font-bold font-mono-code text-[#111827]">
                  [+8.4%, +17.2%]
                </div>
                <div className="text-[11px] text-[#64748B]">Absolute Conversion Delta</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                <span className="text-xs text-[#64748B]">Statistical Power (1 - &beta;)</span>
                <div className="text-2xl font-bold font-mono-code text-[#3867F5]">
                  94.2%
                </div>
                <div className="text-[11px] text-[#64748B]">Sufficient Sample Size Target Met</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: IMPLEMENTATION */}
        {activeTab === "implementation" && (
          <div className="dev-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111827]">Flagsmith SDK Integration</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Production instrumentation snippet evaluated client-side in React 19 / Next.js
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] text-xs font-mono-code text-[#FAF8F5] overflow-x-auto">
              <pre className="text-[#A7F3D0] leading-relaxed">
{`import flagsmith from "flagsmith";

// 1. Evaluate variant for user
const flags = await flagsmith.getIdentityFlags(userId);
const isStreamlined = flags.hasFeature("${experiment.feature_flag_key}");

// 2. Track Exposure Event
await flagsmith.trackEvent({
  event: "experiment_exposure",
  experiment: "${experiment.id}",
  variant: isStreamlined ? "treatment" : "control"
});

// 3. Track Conversion on Success
async function onSignupSuccess() {
  await flagsmith.trackEvent({
    event: "${experiment.metrics.primary_metric}",
    experiment: "${experiment.id}"
  });
}`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 6: AI INSIGHTS */}
        {activeTab === "insights" && (
          <div className="dev-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#3867F5]" />
              <h3 className="text-sm font-semibold text-[#111827]">Agent Interpretation &amp; Decision</h3>
            </div>

            <div className="p-4 rounded-xl bg-[#EFF4FF] border border-[#BFDBFE] text-xs text-[#1E40AF] space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3867F5]" />
                <span>Executive Recommendation</span>
              </div>
              <p className="leading-relaxed">
                {experiment.ai_recommendation}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs space-y-2">
              <div className="font-semibold text-[#111827]">Caveats &amp; Guardrails:</div>
              <ul className="list-disc list-inside space-y-1 text-[#64748B]">
                <li>Lead qualification data (company size/role) must be collected on Day 1 onboarding wizard.</li>
                <li>No negative impact detected on subsequent workspace creation rates.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

