"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { fetchExperiments } from "@/lib/api";
import { Experiment } from "@/types";
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  GitBranch,
  ArrowRight,
  Pause,
  CheckCircle2,
} from "lucide-react";

export default function ExperimentsListPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filter, setFilter] = useState<"all" | "running" | "paused" | "concluded">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    const list = await fetchExperiments();
    setExperiments(list);
  };

  const filtered = experiments.filter((e) => {
    const matchesFilter = filter === "all" || e.status === filter;
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.objective.toLowerCase().includes(search.toLowerCase()) ||
      e.feature_flag_key.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
              Experiments
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Manage and monitor live multivariate feature flags and A/B tests.
            </p>
          </div>

          <Link
            href="/experiments/new"
            className="btn-primary flex items-center gap-2 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New Experiment</span>
          </Link>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] text-xs">
            {(["all", "running", "paused", "concluded"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                  filter === s
                    ? "bg-[#09090B] text-white font-medium"
                    : "text-[#71717A] hover:text-[#09090B]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiments..."
              className="dev-input pl-8 text-xs"
            />
          </div>
        </div>

        {/* Experiments Table */}
        <div className="dev-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Experiment</th>
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Participants</th>
                <th className="py-3 px-4">Conversion Rate</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((exp) => {
                const treatment = exp.variants.find((v) => v.type === "treatment");
                const control = exp.variants.find((v) => v.type === "control");

                return (
                  <tr key={exp.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/experiments/${exp.id}`}
                        className="font-semibold text-[#09090B] hover:text-[#71717A] transition-colors block text-xs"
                      >
                        {exp.name}
                      </Link>
                      <span className="text-[11px] text-[#64748B] line-clamp-1">
                        {exp.objective}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono-code text-[11px] text-[#64748B]">
                      <div className="flex items-center gap-1.5">
                        <GitBranch className="w-3 h-3 text-[#94A3B8]" />
                        <span>{exp.repository_name.split("/")[1] || exp.repository_name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`status-badge ${
                          exp.status === "running"
                            ? "status-badge-active"
                            : exp.status === "paused"
                            ? "status-badge-paused"
                            : "status-badge-draft"
                        }`}
                      >
                        {exp.status === "running" && <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]"></span>}
                        {exp.status === "paused" && <Pause className="w-3 h-3 text-[#D99725]" />}
                        <span className="capitalize">{exp.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono-code text-[#111827]">
                      {exp.total_participants.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#111827] font-mono-code">
                          {treatment?.conversion_rate || 0}%
                        </span>
                        {exp.metrics.relative_lift && exp.metrics.relative_lift > 0 && (
                          <span className="text-[11px] text-[#16A36A] font-medium font-mono-code">
                            (+{exp.metrics.relative_lift.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#94A3B8]">
                        Control: {control?.conversion_rate || 0}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono-code text-[#64748B] text-[11px]">
                      {exp.duration_days} days
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/experiments/${exp.id}`}
                        className="btn-secondary text-[11px] py-1 px-2.5 h-auto"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

