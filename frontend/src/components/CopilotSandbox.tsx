"use client";

import React, { useState } from "react";
import { Copy, Check, Play, Send, Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { ChatResponse } from "@/lib/types";
import { askCopilot, trackConversion } from "@/lib/api";

interface CopilotSandboxProps {
  currentIdentity: string;
  onEventTracked: (event: any) => void;
}

const PRESET_QUERIES = [
  { label: "FASTAPI + SDK", query: "How do I initialize Flagsmith Python SDK with async FastAPI?" },
  { label: "MULTIVARIATE ROUTING", query: "How does deterministic multivariate flag routing work in RAG?" },
  { label: "CONVERSION EVENT", query: "How do I track custom conversion events with Flagsmith analytics?" },
  { label: "TOKEN CONFIG", query: "How do I enforce token budget remote config without redeployment?" }
];

export const CopilotSandbox: React.FC<CopilotSandboxProps> = ({ currentIdentity, onEventTracked }) => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].query);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);
  const [isRunningSandbox, setIsRunningSandbox] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [guardrailSeconds, setGuardrailSeconds] = useState<number | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setIsResolved(false);
    setSandboxOutput(null);

    try {
      const res = await askCopilot(currentIdentity, query);
      setResponse(res);
      setGuardrailSeconds(30);
      const interval = setInterval(() => {
        setGuardrailSeconds((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
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
    setSandboxOutput(">> RUNNING PYTHON RUNTIME...\n>> IDENTITY: " + currentIdentity);

    setTimeout(async () => {
      setIsRunningSandbox(false);
      setSandboxOutput(
        `>> EXIT: 0 (OK)\n>> PIPELINE: ${response.active_variant.toUpperCase()}\n>> LATENCY: ${response.latency_ms}ms\n>> COST: $${response.cost_usd.toFixed(4)}\n>> EVENT: answer_resolved FIRED`
      );

      const eventResult = await trackConversion(
        currentIdentity,
        response.active_variant,
        "answer_resolved",
        response.latency_ms
      );
      onEventTracked(eventResult.event);
      setIsResolved(true);
    }, 500);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono select-none">
      {/* Left: Input & Code */}
      <div className="lg:col-span-7 space-y-3">
        {/* Query Bar */}
        <div className="pixel-box p-3 space-y-2">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1">
            {PRESET_QUERIES.map((p) => (
              <button
                key={p.label}
                onClick={() => setQuery(p.query)}
                className={`text-[10px] px-2 py-0.5 border transition-all ${
                  query === p.query
                    ? "bg-[#151413] text-[#F6F4EE] border-[#151413] font-bold"
                    : "bg-[#EDEAE1] text-[#7A756D] border-[#D3CDC1] hover:text-[#151413]"
                }`}
              >
                [{p.label}]
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2 text-xs text-[#7A756D] font-bold">&gt;</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query documentation..."
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-[#EDEAE1] border border-[#151413] text-[#151413] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="pixel-btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
            >
              {isLoading ? "ROUTING" : "RUN"}
            </button>
          </form>
        </div>

        {/* Code Box */}
        {response ? (
          <div className="pixel-box p-3 space-y-2.5">
            {/* Telemetry Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D3CDC1] pb-1.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="ticker-badge bg-[#151413] text-[#F6F4EE]">
                  {response.active_variant}
                </span>
                <span className="font-bold text-[#151413]">{response.pipeline_title}</span>
              </div>
              <div className="flex items-center gap-3 text-[#7A756D]">
                <span>{response.latency_ms}ms</span>
                <span className="text-[#059669] font-bold">${response.cost_usd.toFixed(4)}</span>
              </div>
            </div>

            {/* Code Block */}
            <div className="border border-[#151413] bg-[#151413] text-[#F6F4EE] p-3 text-xs overflow-x-auto">
              <pre className="text-[#A7F3D0] leading-relaxed">{response.code}</pre>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#D3CDC1]">
              <div className="flex items-center gap-1.5">
                <button onClick={handleCopyCode} className="pixel-btn flex items-center gap-1 py-1 px-2 text-[10px]">
                  {copied ? <Check className="w-3 h-3 text-[#059669]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "COPIED" : "COPY CODE"}</span>
                </button>
                <button
                  onClick={handleRunSandbox}
                  disabled={isRunningSandbox}
                  className="pixel-btn-emerald flex items-center gap-1 py-1 px-2 text-[10px]"
                >
                  <Play className="w-3 h-3" />
                  <span>{isRunningSandbox ? "RUNNING" : "SANDBOX RUN"}</span>
                </button>
              </div>

              <button
                onClick={handleMarkResolved}
                disabled={isResolved}
                className={`pixel-btn py-1 px-2 text-[10px] ${
                  isResolved ? "bg-[#D1FAE5] text-[#065F46] border-[#059669]" : ""
                }`}
              >
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                <span>{isResolved ? "RESOLVED" : "MARK RESOLVED"}</span>
              </button>
            </div>

            {/* Guardrail Ticker */}
            {guardrailSeconds !== null && (
              <div className="text-[9px] text-[#7A756D] flex justify-between px-2 py-0.5 bg-[#EDEAE1] border border-[#D3CDC1]">
                <span>GUARDRAIL: {guardrailSeconds}s ACTIVE</span>
                <span>SUPPRESSES ON ERROR FOLLOW-UP</span>
              </div>
            )}
          </div>
        ) : (
          <div className="pixel-box p-6 text-center text-[#7A756D] text-xs">
            &gt; AWAITING QUERY // CLICK ANY PRESET ABOVE TO RUN
          </div>
        )}
      </div>

      {/* Right: Sandbox Stdout */}
      <div className="lg:col-span-5 space-y-3">
        <div className="pixel-box p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-[#D3CDC1] pb-1.5 text-[10px]">
            <span className="font-bold text-[#151413]">STDOUT // SANDBOX RUNNER</span>
            <span className="ticker-badge">ISOLATED</span>
          </div>

          <div className="bg-[#151413] text-[#A7F3D0] p-3 text-xs min-h-[260px] flex flex-col justify-between border border-[#151413]">
            {sandboxOutput ? (
              <pre className="whitespace-pre-wrap leading-relaxed">{sandboxOutput}</pre>
            ) : (
              <div className="text-[#555] flex flex-col items-center justify-center h-44 space-y-1 text-center">
                <Terminal className="w-6 h-6 text-[#444]" />
                <span className="text-[10px]">&gt; CLICK &quot;SANDBOX RUN&quot; TO TEST CODE</span>
              </div>
            )}

            <div className="border-t border-[#333] pt-1.5 text-[9px] text-[#7A756D] flex items-center justify-between">
              <span>MEM: 12.4 MB</span>
              <span>EXIT: {sandboxOutput ? "0" : "--"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
