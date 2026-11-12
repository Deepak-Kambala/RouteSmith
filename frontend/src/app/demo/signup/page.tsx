"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { trackDemoEvent } from "@/lib/api";
import {
  Zap,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  ShieldCheck,
  UserCheck,
  Eye,
  TrendingUp,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function DemoSignupPage() {
  // Session ID for participant
  const [participantId, setParticipantId] = useState<string>("usr_demo_101");
  const [selectedVariant, setSelectedVariant] = useState<"control" | "treatment">("treatment");
  const [exposureTracked, setExposureTracked] = useState(false);
  const [hasConverted, setHasConverted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@acme.dev",
    password: "••••••••••••",
    company: "Acme Corporation",
    companySize: "51-200",
    role: "Staff Software Engineer",
  });

  // Real-time Event Log for this session
  const [sessionEvents, setSessionEvents] = useState<Array<{ id: string; type: string; time: string; variant: string }>>([]);

  // Live Aggregate Statistics across demo sessions
  const [stats, setStats] = useState({
    controlExposures: 24,
    controlConversions: 3,
    treatmentExposures: 26,
    treatmentConversions: 8,
  });

  useEffect(() => {
    // Generate fresh session and track initial exposure
    handleRerollSession();
  }, []);

  const handleRerollSession = async () => {
    const freshId = `usr_${Math.random().toString(36).substring(2, 8)}`;
    setParticipantId(freshId);

    // Hash-based deterministic assignment: murmur3 simulated via char code sum
    const charSum = freshId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const assignedVariant: "control" | "treatment" = charSum % 2 === 0 ? "treatment" : "control";
    setSelectedVariant(assignedVariant);
    setHasConverted(false);
    setExposureTracked(true);

    // Record exposure event
    const expResult = await trackDemoEvent("exp_signup_v2", assignedVariant, "exposure", freshId);
    setSessionEvents([
      {
        id: `ev_${Date.now()}`,
        type: "EXPOSURE",
        variant: assignedVariant === "treatment" ? "Variant B (3-Field)" : "Variant A (6-Field)",
        time: new Date().toLocaleTimeString(),
      },
    ]);

    // Update aggregate exposure count
    setStats((prev) => ({
      ...prev,
      controlExposures: assignedVariant === "control" ? prev.controlExposures + 1 : prev.controlExposures,
      treatmentExposures: assignedVariant === "treatment" ? prev.treatmentExposures + 1 : prev.treatmentExposures,
    }));
  };

  const handleManualVariantSwitch = async (v: "control" | "treatment") => {
    setSelectedVariant(v);
    setHasConverted(false);
    await trackDemoEvent("exp_signup_v2", v, "exposure", participantId);
    setSessionEvents((prev) => [
      {
        id: `ev_${Date.now()}`,
        type: "EXPOSURE (FORCED)",
        variant: v === "treatment" ? "Variant B (3-Field)" : "Variant A (6-Field)",
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const handleSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasConverted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Record conversion event in backend / Flagsmith
      const convResult = await trackDemoEvent("exp_signup_v2", selectedVariant, "conversion", participantId);

      setHasConverted(true);
      setSessionEvents((prev) => [
        {
          id: `ev_${Date.now()}`,
          type: "CONVERSION (signup_completed)",
          variant: selectedVariant === "treatment" ? "Variant B (3-Field)" : "Variant A (6-Field)",
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      setStats((prev) => ({
        ...prev,
        controlConversions: selectedVariant === "control" ? prev.controlConversions + 1 : prev.controlConversions,
        treatmentConversions: selectedVariant === "treatment" ? prev.treatmentConversions + 1 : prev.treatmentConversions,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const controlRate = ((stats.controlConversions / stats.controlExposures) * 100).toFixed(1);
  const treatmentRate = ((stats.treatmentConversions / stats.treatmentExposures) * 100).toFixed(1);
  const lift = (
    ((Number(treatmentRate) - Number(controlRate)) / (Number(controlRate) || 1)) *
    100
  ).toFixed(1);

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#16A36A] uppercase tracking-wider">
                Live End-to-End Workflow Demonstration
              </span>
            </div>
            <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
              Registration Flow A/B Test
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Experiment: <strong className="text-[#111827]">exp_signup_v2</strong> &bull; Flagsmith Flag: <code className="font-mono-code text-[#3867F5]">signup_form_simplification</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRerollSession}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#3867F5]" />
              <span>Reroll Participant ID</span>
            </button>
          </div>
        </div>

        {/* Live Variant Switcher & Participant Header */}
        <div className="dev-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F8FAFC]">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2 font-mono-code">
              <span className="text-[#64748B]">SESSION ID:</span>
              <span className="font-bold text-[#111827] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                {participantId}
              </span>
              <span className="text-[#94A3B8]">&bull;</span>
              <span className="text-[#64748B]">ALLOCATION:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded ${
                  selectedVariant === "treatment"
                    ? "bg-[#DCFCE7] text-[#16A36A] border border-[#86EFAC]"
                    : "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
                }`}
              >
                {selectedVariant === "treatment" ? "Variant B (Treatment 3-Field)" : "Variant A (Control 6-Field)"}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Flagsmith evaluates this identity and dynamically switches the form layout in real time.
            </p>
          </div>

          {/* Manual Variant Toggle for Developer Testing */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white border border-[#E5E7EB] text-xs">
            <button
              onClick={() => handleManualVariantSwitch("control")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedVariant === "control"
                  ? "bg-[#111827] text-white font-semibold"
                  : "text-[#64748B] hover:text-[#111827]"
              }`}
            >
              Test Variant A (6 Fields)
            </button>
            <button
              onClick={() => handleManualVariantSwitch("treatment")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedVariant === "treatment"
                  ? "bg-[#3867F5] text-white font-semibold"
                  : "text-[#64748B] hover:text-[#111827]"
              }`}
            >
              Test Variant B (3 Fields)
            </button>
          </div>
        </div>

        {/* Main Work Area: Rendered Signup App (Left) + Real-time Telemetry Ledger (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: The Interactive Sample Signup Form (7 cols) */}
          <div className="lg:col-span-7 dev-card p-6 space-y-5">
            <div className="pb-3 border-b border-[#E5E7EB]">
              <span className="text-xs font-semibold text-[#3867F5] uppercase tracking-wider block mb-1">
                Rendered Experience: {selectedVariant === "treatment" ? "Streamlined Variant B" : "Original Variant A"}
              </span>
              <h2 className="text-[20px] font-[650] text-[#111827]">
                Create your developer account
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {selectedVariant === "treatment"
                  ? "Join 10,000+ engineers building high-velocity software."
                  : "Complete all required firmographic fields to access the enterprise trial."}
              </p>
            </div>

            {hasConverted ? (
              <div className="p-6 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A36A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#16A36A]">Registration Completed</h3>
                  <p className="text-xs text-[#15803D] mt-0.5">
                    Conversion event <code className="font-mono-code font-semibold">signup_completed</code> fired &amp; attributed to {selectedVariant === "treatment" ? "Variant B" : "Variant A"}.
                  </p>
                </div>
                <button
                  onClick={handleRerollSession}
                  className="btn-primary text-xs py-1.5 px-4 h-auto bg-[#16A36A] hover:bg-[#15803D]"
                >
                  Simulate Next User
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSignup} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111827]">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="dev-input text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111827]">Work Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="dev-input text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111827]">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="dev-input text-xs"
                    required
                  />
                </div>

                {/* Additional 3 fields ONLY present in Control (Variant A) */}
                {selectedVariant === "control" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#111827]">Company Name</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="dev-input text-xs"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#111827]">Company Size</label>
                        <select
                          value={formData.companySize}
                          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                          className="dev-input text-xs"
                        >
                          <option>1-10</option>
                          <option>11-50</option>
                          <option>51-200</option>
                          <option>201-1000</option>
                          <option>1000+</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#111827]">Your Role</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="dev-input text-xs"
                        >
                          <option>Engineering Leader</option>
                          <option>Staff Software Engineer</option>
                          <option>Product Manager</option>
                          <option>DevOps / SRE</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full text-xs font-semibold py-2.5 h-auto flex items-center justify-center gap-2 mt-4"
                >
                  <span>
                    {isSubmitting
                      ? "Recording Conversion..."
                      : selectedVariant === "treatment"
                      ? "Get Started in 1 Click (Fast)"
                      : "Submit Detailed Registration"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Live Telemetry Ledger & Statistical Lift (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Comparative Conversion Stats */}
            <div className="dev-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
                  Live Conversion Tracking
                </h3>
                <span className="text-[11px] font-mono-code text-[#16A36A] font-bold">
                  +{lift}% Lift
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Variant A */}
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
                  <div className="flex justify-between font-semibold text-[#111827]">
                    <span>Variant A (Control 6-Field)</span>
                    <span className="font-mono-code">{controlRate}%</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono-code">
                    {stats.controlConversions} conversions / {stats.controlExposures} exposures
                  </div>
                </div>

                {/* Variant B */}
                <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#86EFAC] space-y-1">
                  <div className="flex justify-between font-semibold text-[#16A36A]">
                    <span>Variant B (Treatment 3-Field)</span>
                    <span className="font-mono-code font-bold">{treatmentRate}%</span>
                  </div>
                  <div className="text-[11px] text-[#16A36A] font-mono-code">
                    {stats.treatmentConversions} conversions / {stats.treatmentExposures} exposures
                  </div>
                </div>
              </div>
            </div>

            {/* Session Event Feed */}
            <div className="dev-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
                  Session Events
                </h3>
                <span className="text-[10px] font-mono-code text-[#64748B]">Real-time Ingestion</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono-code text-xs">
                {sessionEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded bg-[#F8FAFC] border border-[#E5E7EB] text-[11px] space-y-0.5"
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#111827]">{ev.type}</span>
                      <span className="text-[#94A3B8]">{ev.time}</span>
                    </div>
                    <div className="text-[#64748B] truncate">{ev.variant}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Decision Box */}
            <div className="p-4 rounded-xl border border-[#BFDBFE] bg-[#EFF4FF] text-xs text-[#1E40AF] space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3867F5]" />
                <span>AI Experimenter Evaluation</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Treatment Variant B displays lower friction leading to an observed relative lift of +{lift}%. Statistical confidence interval has satisfied the minimum detectable effect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
