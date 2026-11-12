"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Bot,
  FolderGit2,
  BarChart3,
  Flag,
  Activity,
  Layers,
  FileCode2,
  Settings,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Zap,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();

  const mainNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Experiments", href: "/experiments", icon: FlaskConical },
    { label: "AI Agent", href: "/agent", icon: Bot },
    { label: "Repositories", href: "/repositories", icon: FolderGit2 },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const workspaceNavItems = [
    { label: "Feature Flags", href: "/flags", icon: Flag },
    { label: "Event Explorer", href: "/events", icon: Activity },
    { label: "Integrations", href: "/integrations", icon: Layers },
    { label: "Live Demo Flow", href: "/demo/signup", icon: Zap },
  ];

  const bottomNavItems = [
    { label: "Documentation", href: "/docs", icon: FileCode2 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`h-screen sticky top-0 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        collapsed ? "w-[68px]" : "w-[248px]"
      }`}
    >
      {/* Top Header & Workspace Selector */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#09090B] flex items-center justify-center text-white font-semibold text-sm shadow-xs">
                RS
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-[#111827]">
                  RouteSmith
                </span>
                <span className="text-[11px] text-[#64748B] font-mono-code font-normal">
                  ExperimentOS
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#09090B] flex items-center justify-center text-white font-semibold text-sm mx-auto">
              RS
            </div>
          )}

          {onToggleCollapse && !collapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors"
              title="Collapse sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Workspace Switcher */}
        {!collapsed ? (
          <div className="px-3 pt-3">
            <button className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] text-[#111827] hover:bg-[#F1F5F9] transition-colors">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-[#16A36A]"></span>
                <span className="truncate">production-core</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>
          </div>
        ) : (
          <div className="pt-3 flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A36A]" title="production-core"></span>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="px-3 py-3 space-y-4">
          {/* Main Navigation */}
          <div>
            {!collapsed && (
              <span className="px-3 text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase block mb-1">
                Main
              </span>
            )}
            <nav className="space-y-0.5">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-[#F4F4F5] text-[#09090B] font-semibold"
                        : "text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]/60"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#09090B]" : "text-[#71717A]"}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Workspace Navigation */}
          <div>
            {!collapsed && (
              <span className="px-3 text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase block mb-1">
                Workspace
              </span>
            )}
            <nav className="space-y-0.5">
              {workspaceNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-[#F4F4F5] text-[#09090B] font-semibold"
                        : "text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]/60"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#09090B]" : "text-[#71717A]"}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section: Documentation, Settings & Profile */}
      <div className="p-3 border-t border-[#E5E7EB] space-y-2">
        <nav className="space-y-0.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-[#F4F4F5] text-[#09090B] font-semibold"
                    : "text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]/60"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#09090B]" : "text-[#71717A]"}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                DK
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#111827] truncate">Deepak Kambala</div>
                <div className="text-[10px] text-[#94A3B8] font-mono-code">Staff Engineer</div>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-semibold mx-auto">
              DK
            </div>
          )}

          {onToggleCollapse && collapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors mt-2 block mx-auto"
              title="Expand sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

