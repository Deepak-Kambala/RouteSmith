"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { fetchDashboardData } from "@/lib/api";
import { Experiment } from "@/types";
import {
  FlaskConical,
  Users,
  Percent,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  GitBranch,
  Bot,
  Pause,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{
    active_experiments_count: number;
    total_participants_count: number;
    average_conversion_rate: number;
    completed_experiments_count: number;
    activity_series: Array<{ date: string; exposures: number; conversions: number }>;
    recent_agent_actions: Array<{ id: string; action: string; target: string; time_ago: string; type: string }>;
    recent_experiments: Experiment[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetchDashboardData();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
              Good morning, Deepak
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Here&apos;s what&apos;s happening across your experiments.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/agent"
              className="btn-secondary flex items-center gap-2 text-xs"
            >
              <Bot className="w-3.5 h-3.5 text-[#09090B]" />
              <span>Ask Agent</span>
            </Link>

            <Link
              href="/experiments/new"
              className="btn-primary flex items-center gap-2 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>New Experiment</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Experiments */}
          <div className="dev-card p-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#71717A]">Active Experiments</span>
              <div className="w-7 h-7 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#09090B]">
                <FlaskConical className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[32px] font-[650] tracking-tight text-[#09090B]">
              {data?.active_experiments_count ?? 3}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#059669]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+1 this week</span>
            </div>
          </div>

          {/* Card 2: Total Participants */}
          <div className="dev-card p-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#71717A]">Total Participants</span>
              <div className="w-7 h-7 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#09090B]">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[32px] font-[650] tracking-tight text-[#09090B]">
              {data?.total_participants_count?.toLocaleString() ?? "14,280"}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#059669]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4%</span>
            </div>
          </div>

          {/* Card 3: Average Conversion Rate */}
          <div className="dev-card p-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#71717A]">Avg Conversion Rate</span>
              <div className="w-7 h-7 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#09090B]">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[32px] font-[650] tracking-tight text-[#09090B]">
              {data?.average_conversion_rate ?? 18.4}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#059669]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3.2% lift</span>
            </div>
          </div>

          {/* Card 4: Experiments Completed */}
          <div className="dev-card p-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#71717A]">Experiments Completed</span>
              <div className="w-7 h-7 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#09090B]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[32px] font-[650] tracking-tight text-[#09090B]">
              {data?.completed_experiments_count ?? 8}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
              <span>100% statistically valid</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Activity (Left) + Agent Feed (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Experiment Activity Chart */}
          <div className="lg:col-span-8 dev-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-[600] text-[#09090B]">Experiment Activity</h2>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#09090B]"></span>
                  <span className="text-[#71717A]">Exposures</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                  <span className="text-[#71717A]">Conversions</span>
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full pt-1">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data?.activity_series || []}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#A1A1AA"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#E4E4E7" }}
                    />
                    <YAxis
                      stroke="#A1A1AA"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "6px",
                        border: "1px solid #E4E4E7",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="exposures"
                      stroke="#09090B"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-[#F4F4F5] rounded-lg animate-pulse" />
              )}
            </div>
          </div>

          {/* Right: Agent Activity */}
          <div className="lg:col-span-4 dev-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-[600] text-[#09090B]">Agent Activity</h2>
              <Link href="/agent" className="text-xs text-[#09090B] hover:underline font-medium">
                Workspace &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {(data?.recent_agent_actions || []).map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-medium text-[#111827] block truncate">
                      {action.action}
                    </span>
                    <span className="text-[11px] text-[#64748B] font-mono-code truncate block">
                      {action.target}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-mono-code shrink-0">
                    {action.time_ago}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Experiments Table */}
        <div className="dev-card overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-[15px] font-[600] text-[#09090B]">Recent Experiments</h2>
            <Link
              href="/experiments"
              className="text-xs font-semibold text-[#09090B] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA] text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Experiment</th>
                  <th className="py-2.5 px-3">Repository</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Participants</th>
                  <th className="py-2.5 px-3">Conversion</th>
                  <th className="py-2.5 px-3">Updated</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {(data?.recent_experiments || []).map((exp) => {
                  const treatment = exp.variants.find((v) => v.type === "treatment");

                  return (
                    <tr key={exp.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#09090B]">
                        <Link href={`/experiments/${exp.id}`} className="hover:text-[#71717A] transition-colors">
                          {exp.name}
                        </Link>
                      </td>

                      <td className="py-3 px-3 font-mono-code text-[11px] text-[#64748B]">
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3 text-[#94A3B8]" />
                          <span>{exp.repository_name.split("/")[1] || exp.repository_name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`status-badge ${
                            exp.status === "running"
                              ? "status-badge-active"
                              : exp.status === "paused"
                              ? "status-badge-paused"
                              : "status-badge-draft"
                          }`}
                        >
                          <span className="capitalize">{exp.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono-code text-[#111827]">
                        {exp.total_participants.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-mono-code">
                        <span className="font-semibold text-[#111827]">
                          {treatment?.conversion_rate || 0}%
                        </span>
                        {exp.metrics.relative_lift && exp.metrics.relative_lift > 0 && (
                          <span className="text-[11px] text-[#16A36A] ml-1">
                            (+{exp.metrics.relative_lift.toFixed(1)}%)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[#64748B] font-mono-code text-[11px]">
                        {new Date(exp.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/experiments/${exp.id}`}
                          className="btn-secondary text-[11px] py-1 px-2 h-auto"
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
      </div>
    </AppShell>
  );
}
