"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Settings, Layers, Key, Shield, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-[#E5E7EB]">
          <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
            Workspace Settings
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Configure member permissions, API integrations, and experimentation safety limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/integrations" className="dev-card p-5 space-y-2 hover:border-[#3867F5] transition-all">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3867F5]" />
              <span className="text-sm font-semibold text-[#111827]">Integrations &amp; Environment</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Manage Flagsmith API credentials, GitHub OAuth tokens, and Google Gemini runtimes.
            </p>
          </Link>

          <div className="dev-card p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#16A36A]" />
              <span className="text-sm font-semibold text-[#111827]">Safety Guardrails</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Require 2-person approval before modifying flags in production. Enforce statistical power minimums.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

