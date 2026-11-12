"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Flag, Plus, Search, Sliders, ExternalLink, ShieldCheck } from "lucide-react";

export default function FlagsPage() {
  const flags = [
    {
      key: "signup_form_simplification",
      description: "Controls 3-field streamlined vs 6-field registration form",
      experiment: "Streamlined 3-Field Registration Flow",
      type: "Multivariate (50% / 50%)",
      status: "active",
      updated: "10m ago",
    },
    {
      key: "nav_sticky_cta_experiment",
      description: "Toggles sticky navbar CTA button during documentation scroll",
      experiment: "Sticky Navigation CTA vs Hero Banner",
      type: "Multivariate (50% / 50%)",
      status: "active",
      updated: "2h ago",
    },
    {
      key: "pricing_annual_default",
      description: "Preselects annual billing toggle with 20% discount badge",
      experiment: "Default Annual Billing Toggle with Savings Callout",
      type: "Multivariate (50% / 50%)",
      status: "paused",
      updated: "3d ago",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
              Feature Flags &amp; Remote Config
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Live multivariate feature flags managed directly via Flagsmith.
            </p>
          </div>

          <a
            href="https://flagsmith.com"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>Flagsmith Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="dev-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Flag Key</th>
                <th className="py-3 px-4">Associated Experiment</th>
                <th className="py-3 px-4">Allocation Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {flags.map((flag) => (
                <tr key={flag.key} className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-5 font-mono-code font-semibold text-[#111827]">
                    <div className="flex items-center gap-2">
                      <Flag className="w-3.5 h-3.5 text-[#3867F5]" />
                      <span>{flag.key}</span>
                    </div>
                    <span className="text-[11px] font-normal text-[#64748B] block mt-0.5">
                      {flag.description}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-[#111827]">
                    {flag.experiment}
                  </td>

                  <td className="py-3.5 px-4 font-mono-code text-[11px] text-[#64748B]">
                    {flag.type}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`status-badge ${
                        flag.status === "active" ? "status-badge-active" : "status-badge-paused"
                      }`}
                    >
                      <span className="capitalize">{flag.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right font-mono-code text-[#94A3B8] text-[11px]">
                    {flag.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
