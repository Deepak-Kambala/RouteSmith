"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Command,
  ChevronRight,
  Sparkles,
  Menu,
} from "lucide-react";

interface TopNavProps {
  onOpenMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();

  // Generate breadcrumb items from route
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
      return [{ label: "Dashboard", href: "/dashboard" }];
    }

    const breadcrumbs = [];
    let currentPath = "";

    for (const part of parts) {
      currentPath += `/${part}`;
      const formattedLabel = part
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      breadcrumbs.push({ label: formattedLabel, href: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Link href="/dashboard" className="hover:text-[#111827] transition-colors font-medium">
            RouteSmith
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              <Link
                href={crumb.href}
                className={`transition-colors ${
                  idx === breadcrumbs.length - 1
                    ? "font-semibold text-[#111827]"
                    : "hover:text-[#111827]"
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Quick Search, Agent Indicator & Notifications */}
      <div className="flex items-center gap-3">
        {/* Command Search */}
        <button
          onClick={() => {
            // Trigger ⌘K search event or modal
            const event = new CustomEvent("open-command-palette");
            window.dispatchEvent(event);
          }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] hover:border-[#D1D5DB] hover:text-[#111827] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Search...</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono-code bg-white rounded border border-[#E5E7EB] text-[#64748B]">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* AI Agent Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#09090B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          <span className="font-medium text-[11px]">Ready</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#09090B] text-white flex items-center justify-center text-xs font-semibold">
          DK
        </div>
      </div>
    </header>
  );
};

