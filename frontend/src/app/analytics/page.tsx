"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  BarChart3,
  TrendingUp,
  Percent,
  Calendar,
  Filter,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("Last 14 Days");

  const trendData = [
    { day: "Day 01", control: 11.8, treatment: 16.4 },
    { day: "Day 03", control: 12.1, treatment: 19.8 },
    { day: "Day 05", control: 11.9, treatment: 22.3 },
    { day: "Day 07", control: 12.2, treatment: 23.5 },
    { day: "Day 09", control: 12.0, treatment: 24.1 },
    { day: "Day 11", control: 12.0, treatment: 24.8 },
    { day: "Day 13", control: 12.1, treatment: 25.0 },
  ];

  const variantComparisonData = [
    { name: "3-Field Signup (Treatment)", rate: 24.8, count: 424, exposures: 1710 },
    { name: "Sticky Navbar CTA (Treatment)", rate: 16.9, count: 498, exposures: 2945 },
    { name: "Hero CTA (Control)", rate: 14.0, count: 412, exposures: 2945 },
    { name: "6-Field Signup (Control)", rate: 12.0, count: 205, exposures: 1710 },
    { name: "Annual Default (Treatment)", rate: 8.8, count: 218, exposures: 2485 },
    { name: "Monthly Default (Control)", rate: 7.5, count: 186, exposures: 2485 },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
              Experimentation Analytics
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Bayesian convergence rates, confidence bounds, and multi-variant lifts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#111827]">
              <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
              <span>{dateRange}</span>
            </div>
          </div>
        </div>

        {/* Top 3 Summary Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="dev-card p-5 space-y-1.5">
            <span className="text-xs text-[#64748B]">Average Observed Lift</span>
            <div className="text-[28px] font-[650] text-[#16A36A]">+48.2%</div>
            <div className="text-[11px] text-[#64748B]">Across statistically significant variants</div>
          </div>

          <div className="dev-card p-5 space-y-1.5">
            <span className="text-xs text-[#64748B]">Win Rate</span>
            <div className="text-[28px] font-[650] text-[#111827]">66.7%</div>
            <div className="text-[11px] text-[#16A36A]">2 of 3 running tests beating control</div>
          </div>

          <div className="dev-card p-5 space-y-1.5">
            <span className="text-xs text-[#64748B]">Total Evaluated Sessions</span>
            <div className="text-[28px] font-[650] text-[#3867F5]">14,280</div>
            <div className="text-[11px] text-[#64748B]">Zero allocation skew detected</div>
          </div>
        </div>

        {/* Chart 1: Conversion Rate Divergence Over Time */}
        <div className="dev-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-[600] text-[#111827]">
                Conversion Rate Trajectory: Control vs Treatment
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Signup Simplification Experiment (exp_signup_v2)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A36A]"></span>
                <span className="text-[#64748B]">Variant B (3-Field)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]"></span>
                <span className="text-[#64748B]">Variant A (Control 6-Field)</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="treatment"
                  name="Variant B (Treatment)"
                  stroke="#16A36A"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#16A36A" }}
                />
                <Line
                  type="monotone"
                  dataKey="control"
                  name="Variant A (Control)"
                  stroke="#64748B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: "#64748B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Variant Conversion Rates Bar Chart */}
        <div className="dev-card p-6 space-y-4">
          <div>
            <h2 className="text-[17px] font-[600] text-[#111827]">
              Variant Performance Benchmarking
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Observed conversion percentage across all active and paused experiment arms
            </p>
          </div>

          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={variantComparisonData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#111827" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="rate" name="Conversion Rate" fill="#3867F5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
