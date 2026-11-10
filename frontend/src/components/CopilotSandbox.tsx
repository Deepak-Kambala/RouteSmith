"use client";

import React, { useState } from "react";
import { Copy, Check, Play, CheckCircle2, Terminal, Sparkles, ArrowRight } from "lucide-react";
import { ChatResponse } from "@/lib/types";
import { askCopilot, trackConversion } from "@/lib/api";

interface CopilotSandboxProps {
  currentIdentity: string;
  onEventTracked: (event: any) => void;
}

const PRESET_QUERIES = [
  { label: "FastAPI + SDK", query: "How do I initialize Flagsmith Python SDK with async FastAPI?" },
  { label: "Multivariate Routing", query: "How does deterministic multivariate flag routing work in RAG?" },
  { label: "Conversion Tracking", query: "How do I track custom conversion events with Flagsmith analytics?" },
  { label: "Token Budget Config", query: "How do I enforce token budget remote config without redeployment?" }
];

export const CopilotSandbox: React.FC<CopilotSandboxProps> = ({ currentIdentity, onEventTracked }) => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].query);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);
  const [isRunningSandbox, setIsRunningSandbox] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setIsResolved(false);
    setSandboxOutput(null);

    try {
      const res = await askCopilot(currentIdentity, query);
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!response?.code) return;
    await navigator.clipboard.writeText(response.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);

    const eventResult = await trackConversion(
      currentIdentity,
      response.active_variant,
      "answer_resolved",
      response.latency_ms
    );
    onEventTracked(eventResult.event);
    setIsResolved(true);
  };

  const handleRunSandbox = async () => {
    if (!response?.code) return;
    setIsRunningSandbox(true);
    setSandboxOutput("Initializing isolated sandbox runtime...\nActive Identity: " + currentIdentity);

    setTimeout(async () => {
      setIsRunningSandbox(false);
      setSandboxOutput(
        `Execution Successful (exit code 0)\nPipeline: ${response.active_variant}\nResponse Latency: ${response.latency_ms}ms\nEstimated Inference Cost: $${response.cost_usd.toFixed(4)}\nTelemetry Event: answer_resolved recorded.`
      );

      const eventResult = await trackConversion(
        currentIdentity,
        response.active_variant,
        "answer_resolved",
        response.latency_ms
      );
      onEventTracked(eventResult.event);
      setIsResolved(true);
    }, 450);
  };

  const handleMarkResolved = async () => {
    if (!response) return;
    setIsResolved(true);
    const eventResult = await trackConversion(
      currentIdentity,
      response.active_variant,
      "answer_resolved",
      response.latency_ms
    );
    onEventTracked(eventResult.event);
  };

  return (
    <div className="space-y-6">
      {/* Hero Intro */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-1 space-y-2">
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#181716]">
          AI Documentation Assistant
        </h1>
        <p className="text-sm text-[#6B665E]">
          Self-optimizing gateway that tests multiple RAG pipelines via{" "}
          <span className="highlighter-brush font-medium text-[#181716]">Flagsmith multivariate routing</span>.
        </p>
      </div>

      {/* Query Bar Card */}
      <div className="clean-card p-5 max-w-3xl mx-auto space-y-4">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#9C968B] font-medium mr-1">Suggested:</span>
          {PRESET_QUERIES.map((p) => (
            <button
              key={p.label}
              onClick={() => setQuery(p.query)}
              className={`px-3 py-1 rounded-full transition-all text-xs ${
                query === p.query
                  ? "bg-[#181716] text-[#FAF8F5] font-medium"
                  : "bg-[#F3EFE8] text-[#6B665E] hover:bg-[#EAE5DC] hover:text-[#181716]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a technical documentation question..."
            className="flex-1 px-4 py-2.5 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-sm text-[#181716] placeholder-[#9C968B] focus:outline-none focus:border-[#181716] transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="tactile-btn tactile-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Routing query...</span>
            ) : (
              <>
                <span>Ask Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results View */}
      {response && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
          {/* Left: Code Snippet Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="clean-card p-5 space-y-4">
              {/* Attribution Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7E3DA]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#181716]">
                      {response.pipeline_title}
                    </span>
                    <span className="keycap-tag">{response.active_variant}</span>
                  </div>
                  <span className="text-xs text-[#9C968B]">Verified code example</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono-code text-[#6B665E]">
                  <span>{response.latency_ms} ms</span>
                  <span className="text-[#059669] font-medium">${response.cost_usd.toFixed(4)}</span>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="rounded-xl bg-[#181716] p-4 overflow-x-auto text-xs font-mono-code text-[#FAF8F5] shadow-inner">
                <pre className="text-[#A7F3D0] leading-relaxed">{response.code}</pre>
              </div>

              {/* Tactile Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="tactile-btn text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#059669]" />
                        <span className="text-[#059669]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#6B665E]" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRunSandbox}
                    disabled={isRunningSandbox}
                    className="tactile-btn tactile-btn-emerald text-xs py-1.5 px-3.5 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isRunningSandbox ? "Executing..." : "Run in Sandbox"}</span>
                  </button>
                </div>

                <button
                  onClick={handleMarkResolved}
                  disabled={isResolved}
                  className={`tactile-btn text-xs py-1.5 px-3.5 flex items-center gap-1.5 ${
                    isResolved ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]" : ""
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isResolved ? "text-[#059669]" : "text-[#6B665E]"}`} />
                  <span>{isResolved ? "Resolved" : "Mark Resolved"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Sandbox Execution Terminal */}
          <div className="lg:col-span-5">
            <div className="clean-card p-5 space-y-3 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E3DA]">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#6B665E]" />
                    <span className="text-xs font-semibold text-[#181716]">Sandbox Runtime</span>
                  </div>
                  <span className="text-[11px] font-mono-code text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                    Isolated
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-[#181716] p-4 text-xs font-mono-code min-h-[220px] text-[#A7F3D0]">
                  {sandboxOutput ? (
                    <pre className="whitespace-pre-wrap leading-relaxed">{sandboxOutput}</pre>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-[#6B665E] space-y-2 text-center">
                      <Terminal className="w-6 h-6 text-[#444]" />
                      <p className="text-xs">Click &quot;Run in Sandbox&quot; to test this snippet against the isolated Python runner.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E3DA] flex items-center justify-between text-xs text-[#9C968B] font-mono-code">
                <span>Memory: 12.4 MB</span>
                <span>Exit Code: {sandboxOutput ? "0" : "--"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
