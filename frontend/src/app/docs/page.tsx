"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FileCode2, ExternalLink, Terminal, ShieldCheck } from "lucide-react";

export default function DocsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-[#E5E7EB]">
          <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
            Documentation &amp; SDK Guides
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            How RouteSmith orchestrates automated A/B experimentation and Flagsmith feature flags.
          </p>
        </div>

        <div className="dev-card p-6 space-y-4">
          <h2 className="text-[17px] font-[600] text-[#111827]">Quickstart Integration</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Install the Flagsmith client in your Next.js, React, or Python application to evaluate multivariate experiments.
          </p>

          <div className="p-4 rounded-xl bg-[#111827] text-xs font-mono-code text-[#FAF8F5] overflow-x-auto">
            <pre className="text-[#A7F3D0] leading-relaxed">
{`# 1. Install Flagsmith SDK
npm install flagsmith

# 2. Initialize in Next.js Root Provider
import flagsmith from "flagsmith";

await flagsmith.init({
  environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_CLIENT_KEY,
  onChange: (oldFlags, params) => {
    console.log("Flags updated", params);
  }
});`}
            </pre>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
