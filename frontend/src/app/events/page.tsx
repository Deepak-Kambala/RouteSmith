"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Activity, Search, Filter, ShieldCheck, Database } from "lucide-react";

export default function EventsPage() {
  const events = [
    {
      id: "evt_109283",
      experiment: "exp_signup_v2",
      participant: "usr_8841fa",
      type: "conversion",
      metric: "signup_completed",
      variant: "Variant B (3-Field)",
      time: "1m ago",
    },
    {
      id: "evt_109282",
      experiment: "exp_signup_v2",
      participant: "usr_8841fa",
      type: "exposure",
      metric: "form_rendered",
      variant: "Variant B (3-Field)",
      time: "2m ago",
    },
    {
      id: "evt_109281",
      experiment: "exp_cta_placement",
      participant: "usr_3910ff",
      type: "conversion",
      metric: "trial_started",
      variant: "Variant B (Sticky Navbar)",
      time: "4m ago",
    },
    {
      id: "evt_109280",
      experiment: "exp_signup_v2",
      participant: "usr_6621ce",
      type: "exposure",
      metric: "form_rendered",
      variant: "Variant A (6-Field)",
      time: "5m ago",
    },
    {
      id: "evt_109279",
      experiment: "exp_pricing_annual",
      participant: "usr_9901aa",
      type: "exposure",
      metric: "pricing_viewed",
      variant: "Variant A (Monthly Default)",
      time: "7m ago",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
              Event Explorer
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Live event ingestion stream with deduplication and participant identity attribution.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-code text-[#16A36A] bg-[#F0FDF4] px-3 py-1.5 rounded-lg border border-[#BBF7D0]">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Event Buffer Synced</span>
          </div>
        </div>

        <div className="dev-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Event ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4">Experiment</th>
                <th className="py-3 px-4">Assigned Variant</th>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-mono-code text-[11px]">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-5 font-semibold text-[#111827]">{ev.id}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        ev.type === "conversion"
                          ? "bg-[#DCFCE7] text-[#16A36A]"
                          : "bg-[#EFF4FF] text-[#3867F5]"
                      }`}
                    >
                      {ev.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#111827] font-semibold">{ev.metric}</td>
                  <td className="py-3 px-4 text-[#64748B]">{ev.experiment}</td>
                  <td className="py-3 px-4 text-[#111827]">{ev.variant}</td>
                  <td className="py-3 px-4 text-[#64748B]">{ev.participant}</td>
                  <td className="py-3 px-5 text-right text-[#94A3B8]">{ev.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
