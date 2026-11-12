"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Bot,
  Sparkles,
  GitBranch,
  FolderGit2,
  ShieldAlert,
  Play,
  FileCode2,
  Sliders,
  Check,
} from "lucide-react";

export default function NewExperimentPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [objective, setObjective] = useState(
    "Increase signup conversion by simplifying the registration flow and removing non-essential fields."
  );
  const [selectedRepo, setSelectedRepo] = useState("Deepak-Kambala/RouteSmith");
  const [selectedBranch, setSelectedBranch] = useState("main");

  // Analysis Progress Simulation based on real backend step
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generated Proposal State
  const [proposal, setProposal] = useState({
    name: "Streamlined 3-Field Registration Flow",
    business_objective: "Reduce friction during user onboarding to lift visitor-to-signup conversion.",
    hypothesis: "By removing optional company size and job title fields from the initial signup screen, form abandonment will drop by 20% without impacting lead qualification.",
    control_variant: {
      name: "Variant A (Control 6-Field)",
      description: "Original 6-field registration form (Name, Email, Password, Company, Company Size, Role).",
    },
    treatment_variant: {
      name: "Variant B (Treatment 3-Field)",
      description: "Optimized 3-field registration form (Name, Work Email, Password) with progressive profile enrichment post-signup.",
    },
    primary_metric: "signup_completed",
    secondary_metrics: "time_to_complete_seconds, activation_rate",
    target_audience: "All new desktop and mobile website visitors (100% eligible traffic)",
    potential_risks: "Slight delay in company firmographic data enrichment before onboarding wizard.",
    suggested_duration: "14 days (or until reaching 3,000 unique exposures)",
    feature_flag_key: "signup_form_simplification",
  });

  const handleStartAnalysis = () => {
    setStep(3);
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const stages = [20, 45, 70, 90, 100];
    let stageIdx = 0;

    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setAnalysisProgress(stages[stageIdx]);
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        setStep(4);
      }
    }, 600);
  };

  const handleApproveAndLaunch = () => {
    // Navigate to experiments overview
    router.push("/experiments/exp_signup_v2");
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/experiments"
            className="text-xs text-[#64748B] hover:text-[#111827] flex items-center gap-1.5 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Experiments</span>
          </Link>

          <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
            New Experiment
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Turn any product objective into a live, Flagsmith-instrumented experiment with AI assistance.
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="dev-card p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#3867F5] font-semibold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? "bg-[#3867F5] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                1
              </span>
              <span>Objective</span>
            </div>
            <div className="h-[1px] w-8 bg-[#E5E7EB]"></div>

            <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#3867F5] font-semibold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? "bg-[#3867F5] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                2
              </span>
              <span>Repository</span>
            </div>
            <div className="h-[1px] w-8 bg-[#E5E7EB]"></div>

            <div className={`flex items-center gap-2 ${step >= 3 ? "text-[#3867F5] font-semibold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? "bg-[#3867F5] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                3
              </span>
              <span>AI Analysis</span>
            </div>
            <div className="h-[1px] w-8 bg-[#E5E7EB]"></div>

            <div className={`flex items-center gap-2 ${step >= 4 ? "text-[#3867F5] font-semibold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 4 ? "bg-[#3867F5] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                4
              </span>
              <span>Proposal</span>
            </div>
            <div className="h-[1px] w-8 bg-[#E5E7EB]"></div>

            <div className={`flex items-center gap-2 ${step >= 5 ? "text-[#3867F5] font-semibold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 5 ? "bg-[#3867F5] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                5
              </span>
              <span>Approval</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Objective */}
        {step === 1 && (
          <div className="dev-card p-6 space-y-5">
            <div>
              <h2 className="text-[17px] font-[600] text-[#111827]">
                Step 1: What do you want to improve?
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Describe your target business goal or user friction point in plain English.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={4}
                className="w-full p-3.5 text-sm rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-[#3867F5]/10 leading-relaxed"
                placeholder="e.g. Increase signup conversion on my website by reducing form fields."
              />

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#94A3B8] font-medium mr-1">Quick Suggestions:</span>
                {[
                  "Increase signup conversion by simplifying the registration flow",
                  "Test annual pricing discount toggle on pricing page",
                  "Optimize sticky documentation trial CTA for mobile visitors",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setObjective(s)}
                    className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] text-[#64748B] hover:text-[#111827] hover:border-[#CBD5E1] transition-all text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={!objective.trim()}
                className="btn-primary flex items-center gap-2 text-xs font-semibold"
              >
                <span>Continue to Repository</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Repository Selection */}
        {step === 2 && (
          <div className="dev-card p-6 space-y-5">
            <div>
              <h2 className="text-[17px] font-[600] text-[#111827]">
                Step 2: Select Connected GitHub Repository
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                RouteSmith will inspect application ASTs, routes, and components without modifying code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedRepo("Deepak-Kambala/RouteSmith")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedRepo === "Deepak-Kambala/RouteSmith"
                    ? "border-[#3867F5] bg-[#EFF4FF]/50 ring-2 ring-[#3867F5]/20"
                    : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#111827]">
                    <FolderGit2 className="w-4 h-4 text-[#3867F5]" />
                    <span>Deepak-Kambala/RouteSmith</span>
                  </div>
                  <span className="status-badge status-badge-active text-[10px]">Connected</span>
                </div>
                <p className="text-[11px] text-[#64748B] mb-3">
                  Next.js 16 App Router + FastAPI. 24 components, 8 routes detected.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#94A3B8] font-mono-code">
                  <GitBranch className="w-3 h-3" />
                  <span>Branch: {selectedBranch}</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedRepo("Deepak-Kambala/acme-saas-frontend")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedRepo === "Deepak-Kambala/acme-saas-frontend"
                    ? "border-[#3867F5] bg-[#EFF4FF]/50 ring-2 ring-[#3867F5]/20"
                    : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-xs text-[#111827]">
                    <FolderGit2 className="w-4 h-4 text-[#64748B]" />
                    <span>Deepak-Kambala/acme-saas-frontend</span>
                  </div>
                  <span className="status-badge status-badge-draft text-[10px]">Standby</span>
                </div>
                <p className="text-[11px] text-[#64748B] mb-3">
                  React 19 + Vite. 42 components, 14 routes detected.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#94A3B8] font-mono-code">
                  <GitBranch className="w-3 h-3" />
                  <span>Branch: production</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary text-xs"
              >
                &larr; Back
              </button>

              <button
                onClick={handleStartAnalysis}
                className="btn-primary flex items-center gap-2 text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Agent Repository Analysis</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AI Analysis in Progress */}
        {step === 3 && (
          <div className="dev-card p-8 space-y-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#EFF4FF] border border-[#BFDBFE] flex items-center justify-center text-[#3867F5] mx-auto animate-pulse">
              <Bot className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <h2 className="text-[18px] font-[650] text-[#111827]">
                Analyzing Repository &amp; Experiment Surfaces
              </h2>
              <p className="text-xs text-[#64748B]">
                Inspecting AST component hierarchies in <span className="font-mono-code font-semibold">{selectedRepo}</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                <div
                  className="h-full bg-[#3867F5] transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-mono-code text-[#64748B]">
                <span>Status: {analysisProgress < 50 ? "Parsing ASTs" : analysisProgress < 90 ? "Synthesizing Hypotheses" : "Generating Variants"}</span>
                <span>{analysisProgress}%</span>
              </div>
            </div>

            {/* Step Checkpoints */}
            <div className="max-w-md mx-auto text-left space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-[#111827]">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
                <span>Understood business objective: <strong>Reduce signup form friction</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#111827]">
                <CheckCircle2 className={`w-4 h-4 ${analysisProgress >= 45 ? "text-[#16A36A]" : "text-[#E5E7EB]"} shrink-0`} />
                <span>Located signup component: <code className="text-[11px] font-mono-code text-[#3867F5]">src/components/SignupForm.tsx</code></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#111827]">
                <CheckCircle2 className={`w-4 h-4 ${analysisProgress >= 70 ? "text-[#16A36A]" : "text-[#E5E7EB]"} shrink-0`} />
                <span>Identified 6 form input nodes and validation schema</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#111827]">
                <CheckCircle2 className={`w-4 h-4 ${analysisProgress >= 90 ? "text-[#16A36A]" : "text-[#E5E7EB]"} shrink-0`} />
                <span>Formulated treatment variant: 3-field stream with progressive profiling</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Experiment Proposal */}
        {step === 4 && (
          <div className="dev-card p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-[17px] font-[600] text-[#111827]">
                  Step 4: AI Experiment Proposal
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Review the hypothesis, variants, metrics, and risks generated by the agent. All fields are editable.
                </p>
              </div>
              <span className="status-badge status-badge-concluded text-xs">
                Generated by Gemini 2.0
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#111827]">Experiment Name</label>
                <input
                  type="text"
                  value={proposal.name}
                  onChange={(e) => setProposal({ ...proposal, name: e.target.value })}
                  className="dev-input text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#111827]">Hypothesis</label>
                <textarea
                  value={proposal.hypothesis}
                  onChange={(e) => setProposal({ ...proposal, hypothesis: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-lg border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#3867F5]"
                />
              </div>

              {/* Control vs Treatment */}
              <div className="p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] space-y-1.5">
                <div className="text-xs font-semibold text-[#111827] flex items-center justify-between">
                  <span>Control (50% Traffic)</span>
                  <span className="font-mono-code text-[11px] text-[#64748B]">Variant A</span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {proposal.control_variant.description}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border-2 border-[#3867F5] bg-[#EFF4FF]/40 space-y-1.5">
                <div className="text-xs font-semibold text-[#1E40AF] flex items-center justify-between">
                  <span>Treatment (50% Traffic)</span>
                  <span className="font-mono-code text-[11px] text-[#3867F5] font-bold">Variant B</span>
                </div>
                <p className="text-xs text-[#1E40AF] leading-relaxed">
                  {proposal.treatment_variant.description}
                </p>
              </div>

              {/* Metrics */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Primary Success Metric</label>
                <input
                  type="text"
                  value={proposal.primary_metric}
                  onChange={(e) => setProposal({ ...proposal, primary_metric: e.target.value })}
                  className="dev-input text-xs font-mono-code"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Flagsmith Feature Flag Key</label>
                <input
                  type="text"
                  value={proposal.feature_flag_key}
                  onChange={(e) => setProposal({ ...proposal, feature_flag_key: e.target.value })}
                  className="dev-input text-xs font-mono-code"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Target Audience</label>
                <input
                  type="text"
                  value={proposal.target_audience}
                  onChange={(e) => setProposal({ ...proposal, target_audience: e.target.value })}
                  className="dev-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Suggested Duration</label>
                <input
                  type="text"
                  value={proposal.suggested_duration}
                  onChange={(e) => setProposal({ ...proposal, suggested_duration: e.target.value })}
                  className="dev-input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary text-xs"
              >
                &larr; Back
              </button>

              <button
                onClick={() => setStep(5)}
                className="btn-primary flex items-center gap-2 text-xs font-semibold"
              >
                <span>Proceed to Human Approval</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Human Approval */}
        {step === 5 && (
          <div className="dev-card p-6 space-y-6">
            <div>
              <h2 className="text-[17px] font-[600] text-[#111827]">
                Step 5: Review &amp; Human Approval
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                RouteSmith requires explicit human approval before creating flags in Flagsmith or modifying code.
              </p>
            </div>

            {/* Verification Checklist */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-3">
              <div className="text-xs font-semibold text-[#111827]">Actions that will be executed upon approval:</div>
              <ul className="space-y-2 text-xs text-[#64748B]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span>Create Flagsmith feature flag: <code className="font-mono-code text-[#111827]">{proposal.feature_flag_key}</code> (50/50 multivariate split)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span>Instrument exposure tracking in <code className="font-mono-code text-[#111827]">SignupForm.tsx</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span>Instrument conversion event for <code className="font-mono-code text-[#111827]">{proposal.primary_metric}</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span>Initialize Bayesian Beta prior distributions: Beta(1, 1)</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(4)}
                className="btn-secondary text-xs"
              >
                &larr; Back to Proposal
              </button>

              <button
                onClick={handleApproveAndLaunch}
                className="btn-primary flex items-center gap-2 text-xs font-semibold bg-[#16A36A] hover:bg-[#15803D]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve &amp; Launch Experiment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
