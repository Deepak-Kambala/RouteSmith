"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { fetchRepositories } from "@/lib/api";
import { Repository } from "@/types";
import {
  FolderGit2,
  GitBranch,
  RefreshCw,
  Plus,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isScanning, setIsScanning] = useState<string | null>(null);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    const list = await fetchRepositories();
    setRepos(list);
  };

  const handleScanRepo = (id: string) => {
    setIsScanning(id);
    setTimeout(() => {
      setIsScanning(null);
    }, 1500);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-[26px] font-[650] tracking-tight text-[#111827]">
              Connected Repositories
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Code intelligence via AST parsing, route discovery, and commit-cached indexing.
            </p>
          </div>

          <button
            onClick={() => alert("GitHub App connection dialog")}
            className="btn-primary flex items-center gap-2 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Connect GitHub Repository</span>
          </button>
        </div>

        {/* Incremental Caching Info Banner */}
        <div className="p-4 rounded-xl border border-[#E4E4E7] bg-white flex items-center justify-between text-xs text-[#71717A]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#09090B] shrink-0" />
            <span>
              <strong>Selective AST Indexing:</strong> RouteSmith caches component trees by git commit hash. Only modified files are parsed during agent reasoning sessions.
            </span>
          </div>
          <span className="font-mono-code text-[11px] text-[#059669] font-semibold bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
            Cache Active
          </span>
        </div>

        {/* Repositories List */}
        <div className="grid grid-cols-1 gap-4">
          {repos.map((repo) => (
            <div key={repo.id} className="dev-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E4E7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] text-[#09090B] flex items-center justify-center">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[17px] font-[600] text-[#09090B]">{repo.owner}/{repo.name}</h2>
                      <span className="status-badge status-badge-active text-[10px]">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#71717A] font-mono-code mt-0.5">
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-3.5 h-3.5 text-[#A1A1AA]" />
                        <span>branch: {repo.default_branch}</span>
                      </div>
                      <span>&bull;</span>
                      <span>commit: {repo.last_analyzed_commit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScanRepo(repo.id)}
                    disabled={isScanning === repo.id}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning === repo.id ? "animate-spin text-[#09090B]" : ""}`} />
                    <span>{isScanning === repo.id ? "Parsing AST..." : "Re-analyze AST"}</span>
                  </button>

                  <a
                    href={`https://github.com/${repo.owner}/${repo.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost text-xs flex items-center gap-1"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                  <span className="text-[#64748B] block">Framework Detected</span>
                  <span className="font-semibold text-[#111827] mt-0.5 block truncate">
                    {repo.detected_framework}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                  <span className="text-[#64748B] block">Indexed Components</span>
                  <span className="font-semibold text-[#111827] font-mono-code mt-0.5 block">
                    {repo.component_count} components
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                  <span className="text-[#64748B] block">Application Routes</span>
                  <span className="font-semibold text-[#111827] font-mono-code mt-0.5 block">
                    {repo.route_count} routes
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
                  <span className="text-[#71717A] block">Active Experiments</span>
                  <span className="font-semibold text-[#09090B] font-mono-code mt-0.5 block">
                    {repo.experiment_count} tests
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

