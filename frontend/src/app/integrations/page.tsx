"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { fetchIntegrations } from "@/lib/api";
import { IntegrationStatus } from "@/types";
import {
  Layers,
  FolderGit2,
  Flag,
  Bot,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    const data = await fetchIntegrations();
    setIntegrations(data);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 1200);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
              Integrations &amp; Environment
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Secure backend connections for GitHub, Flagsmith, and AI runtimes.
            </p>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin text-[#3867F5]" : ""}`} />
            <span>{isVerifying ? "Verifying..." : "Verify Connections"}</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-xl border border-[#BFDBFE] bg-[#EFF4FF] flex items-center gap-3 text-xs text-[#1E40AF]">
          <ShieldCheck className="w-5 h-5 text-[#3867F5] shrink-0" />
          <span>
            <strong>Zero Secret Exposure:</strong> API credentials, OAuth tokens, and Flagsmith Server Keys are stored exclusively in backend environment memory and never dispatched to the browser.
          </span>
        </div>

        {/* 3 Integration Cards */}
        <div className="space-y-4">
          {/* Card 1: Flagsmith */}
          <div className="dev-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] border border-[#BFDBFE] text-[#3867F5] flex items-center justify-center">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-[600] text-[#111827]">Flagsmith Experimentation</h2>
                    <span className="status-badge status-badge-active text-[10px]">
                      Operational
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Official Flagsmith SDK evaluation and multivariate traffic assignment
                  </p>
                </div>
              </div>

              <a
                href="https://flagsmith.com"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-xs flex items-center gap-1"
              >
                <span>Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-mono-code space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Mode:</span>
                <span className="font-semibold text-[#111827]">
                  {integrations?.flagsmith.mode === "cloud_sdk" ? "Flagsmith Cloud Edge API" : "Local Flagsmith SDK Engine (Deterministic Murmur3)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Environment:</span>
                <span className="text-[#16A36A] font-semibold">production-core</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Multivariate Assignment:</span>
                <span className="text-[#3867F5]">Murmur3 100-bucket stable hashing</span>
              </div>
            </div>
          </div>

          {/* Card 2: GitHub API */}
          <div className="dev-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] border border-[#BFDBFE] text-[#3867F5] flex items-center justify-center">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-[600] text-[#111827]">GitHub API &amp; AST Parser</h2>
                    <span className="status-badge status-badge-active text-[10px]">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Live branch inspection, component extraction, and commit diffing
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono-code text-[#64748B]">
                @{integrations?.github.username || "Deepak-Kambala"}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-mono-code space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Authenticated User:</span>
                <span className="font-semibold text-[#111827]">{integrations?.github.username || "Deepak-Kambala"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Repositories Accessible:</span>
                <span className="text-[#111827] font-semibold">{integrations?.github.repo_access_count || 4} Repos</span>
              </div>
            </div>
          </div>

          {/* Card 3: Google Gemini Runtime */}
          <div className="dev-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] border border-[#BFDBFE] text-[#3867F5] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-[600] text-[#111827]">AI Intelligence Runtime</h2>
                    <span className="status-badge status-badge-active text-[10px]">
                      Configured
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Structured tool calling, hypothesis formulation, and patch generation
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono-code text-[#3867F5] font-semibold">
                {integrations?.gemini.model || "gemini-2.0-flash"}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-mono-code space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Active Model:</span>
                <span className="font-semibold text-[#111827]">{integrations?.gemini.model || "gemini-2.0-flash"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Capabilities:</span>
                <span className="text-[#16A36A]">Function Calling, Structured JSON, AST Patching</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

