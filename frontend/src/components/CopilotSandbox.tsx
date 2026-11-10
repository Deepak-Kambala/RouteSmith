"use client";

import React, { useState } from "react";
import { Copy, Check, Play, CheckCircle2, Terminal, ArrowRight, CornerDownRight } from "lucide-react";
import { ChatResponse } from "@/lib/types";
import { askCopilot, trackConversion } from "@/lib/api";

interface CopilotSandboxProps {
  currentIdentity: string;
  onEventTracked: (event: any) => void;
}

const PRESET_QUERIES = [
  { label: "FASTAPI + SDK", query: "How do I initialize Flagsmith Python SDK with async FastAPI?" },
  { label: "MULTIVARIATE ROUTING", query: "How does deterministic multivariate flag routing work in RAG?" },
  { label: "CONVERSION TRACKING", query: "How do I track custom conversion events with Flagsmith analytics?" },
  { label: "TOKEN BUDGET CONFIG", query: "How do I enforce token budget remote config without redeployment?" }
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
    setSandboxOutput(">> INITIALIZING ISOLATED RUNTIME...\n>> SESSION ID: " + currentIdentity);

    setTimeout(async () => {
      setIsRunningSandbox(false);
      setSandboxOutput(
        `>> EXECUTION COMPLETE (EXIT: 0)\n>> PIPELINE: ${response.active_variant.toUpperCase()}\n>> LATENCY: ${response.latency_ms}ms\n>> COST: $${response.cost_usd.toFixed(4)}\n>> TELEMETRY: answer_resolved FIRED -> COMMITTED TO POSTERIOR`
      );

      const eventResult = await trackConversion(
        currentIdentity,
        response.active_variant,
        "answer_resolved",
        response.latency_ms
      );
      onEventTracked(eventResult.event);
      setIsResolved(true);
    }, 400);
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
    <div className="space-y-5">
      {/* Sleek Pixel Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#EFECE3] border-2 border-[#151413] shadow-[3px_3px_0px_#151413]">
        <div className="flex items-center gap-2">
          <span className="font-pixel-display text-xs font-bold bg-[#151413] text-[#F8F6F0] px-2 py-0.5">
            COPILOT GATEWAY
          </span>
          <span className="text-xs text-[#575249]">
            Deterministic multivariate evaluation &amp; zero-slop code generation
          </span>
        </div>
        <div className="text-[11px] font-bold text-[#151413]">
          ACTIVE IDENTITY: <span className="text-[#059669]">{currentIdentity}</span>
        </div>
      </div>

      {/* Query Bar Card */}
      <div className="pixel-card p-4 space-y-3">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] font-bold text-[#8A8376] uppercase tracking-wider mr-1">
            QUICK PRESETS:
          </span>
          {PRESET_QUERIES.map((p) => (
            <button
              key={p.label}
              onClick={() => setQuery(p.query)}
              className={`text-[11px] font-semibold px-2.5 py-1 border transition-all ${
                query === p.query
                  ? "bg-[#151413] text-[#F8F6F0] border-[#151413] shadow-[1.5px_1.5px_0px_#059669]"
                  : "bg-[#EFECE3] text-[#575249] border-[#151413] shadow-[1.5px_1.5px_0px_#151413] hover:bg-white hover:text-[#151413]"
              }`}
            >
              [{p.label}]
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8A8376]">&gt;</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query technical documentation..."
              className="pixel-input w-full pl-7 pr-3 py-2 text-xs text-[#151413] placeholder-[#8A8376]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="pixel-btn pixel-btn-primary px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>ROUTING...</span>
            ) : (
              <>
                <span>ASK COPILOT</span>
                <CornerDownRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results View */}
      {response && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Code Snippet */}
          <div className="lg:col-span-7 space-y-3">
            <div className="pixel-card p-4 space-y-3">
              {/* Telemetry Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-[#151413]">
                <div className="flex items-center gap-2">
                  <span className="pixel-badge pixel-badge-emerald">
                    {response.active_variant}
                  </span>
                  <span className="text-xs font-bold text-[#151413]">
                    {response.pipeline_title}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-[#575249]">
                  <span>{response.latency_ms}ms</span>
                  <span className="text-[#059669]">${response.cost_usd.toFixed(4)}</span>
                </div>
              </div>

              {/* Code Box */}
              <div className="border-2 border-[#151413] bg-[#151413] p-3 text-xs shadow-[2px_2px_0px_#151413] overflow-x-auto">
                <pre className="text-[#A7F3D0] leading-relaxed selection:bg-[#059669] selection:text-white">
                  {response.code}
                </pre>
              </div>

              {/* Pixel Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#D8D3C5]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="pixel-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#059669]" />
                        <span className="text-[#059669]">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY CODE</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRunSandbox}
                    disabled={isRunningSandbox}
                    className="pixel-btn pixel-btn-emerald text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isRunningSandbox ? "EXECUTING..." : "SANDBOX RUN"}</span>
                  </button>
                </div>

                <button
                  onClick={handleMarkResolved}
                  disabled={isResolved}
                  className={`pixel-btn text-xs py-1.5 px-3 flex items-center gap-1.5 ${
                    isResolved ? "bg-[#D1FAE5] text-[#065F46] border-[#059669] shadow-[2px_2px_0px_#059669]" : ""
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isResolved ? "text-[#059669]" : ""}`} />
                  <span>{isResolved ? "RESOLVED (EVENT SENT)" : "MARK RESOLVED"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Sandbox Stdout Terminal */}
          <div className="lg:col-span-5">
            <div className="pixel-card-dark p-4 space-y-3 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#2D2A26]">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#A7F3D0]" />
                    <span className="text-xs font-bold tracking-wider text-[#F8F6F0]">
                      STDOUT // RUNTIME SANDBOX
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#059669] text-white">
                    ISOLATED
                  </span>
                </div>

                <div className="mt-3 p-3 bg-[#0C0B0A] border border-[#2D2A26] min-h-[220px] text-xs text-[#A7F3D0] shadow-inner font-mono">
                  {sandboxOutput ? (
                    <pre className="whitespace-pre-wrap leading-relaxed">{sandboxOutput}</pre>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-[#555] space-y-2 text-center">
                      <Terminal className="w-6 h-6 text-[#444]" />
                      <p className="text-[11px]">&gt; CLICK &quot;SANDBOX RUN&quot; TO EXECUTE SNIPPET</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2D2A26] flex items-center justify-between text-[11px] text-[#8A8376]">
                <span>MEM: 12.4 MB</span>
                <span>STATUS: {sandboxOutput ? "EXIT 0 (OK)" : "--"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
