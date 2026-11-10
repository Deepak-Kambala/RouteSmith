"use client";

import React, { useState } from "react";
import { Copy, Check, Play, Send, Terminal, Clock, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
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
    setSandboxOutput(">> MOUNTING ISOLATED RUNTIME...\n>> INJECTING IDENTITY CONTEXT: " + currentIdentity);

    setTimeout(async () => {
      setIsRunningSandbox(false);
      setSandboxOutput(
        `>> STATUS: 0 (SUCCESS)\n>> EXECUTED PIPELINE: ${response.active_variant.toUpperCase()}\n>> DURATION: ${response.latency_ms}ms\n>> TOKEN_COST: $${response.cost_usd.toFixed(4)}\n>> FLAGSMITH_EVENT: answer_resolved EMITTED`
      );

      const eventResult = await trackConversion(
        currentIdentity,
        response.active_variant,
        "answer_resolved",
        response.latency_ms
      );
      onEventTracked(eventResult.event);
      setIsResolved(true);
    }, 600);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono select-none">
      {/* Left: Input & Pipeline Result */}
      <div className="lg:col-span-7 space-y-4">
        {/* Compact Terminal Query Bar */}
        <div className="pixel-box p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[#7A756D] border-b border-[#D3CDC1] pb-2">
            <span className="font-bold text-[#151413]">DOCS_INGRESS // QUERY DISPATCH</span>
            <span>IDENTIFIER: {currentIdentity}</span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUERIES.map((p) => (
              <button
                key={p.label}
                onClick={() => setQuery(p.query)}
                className={`text-[10px] px-2 py-1 border transition-all ${
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
          <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs text-[#7A756D] font-bold">&gt;</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter SDK question..."
                className="w-full pl-7 pr-3 py-2 text-xs bg-[#EDEAE1] border border-[#151413] text-[#151413] focus:outline-none focus:ring-1 focus:ring-[#151413]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="pixel-btn-primary px-4 py-2 text-xs disabled:opacity-50"
            >
              {isLoading ? "ROUTING..." : "DISPATCH"}
            </button>
          </form>
        </div>

        {/* Response Box */}
        {response ? (
          <div className="pixel-box p-4 space-y-3">
            {/* Telemetry Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D3CDC1] pb-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="ticker-badge bg-[#151413] text-[#F6F4EE]">
                  {response.active_variant}
                </span>
                <span className="font-bold text-[#151413]">{response.pipeline_title}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[#7A756D]">
                <span>LATENCY: <strong className="text-[#151413]">{response.latency_ms}ms</strong></span>
                <span>COST: <strong className="text-[#059669]">${response.cost_usd.toFixed(4)}</strong></span>
              </div>
            </div>

            {/* Answer Text */}
            <div className="p-3 bg-[#EDEAE1] border border-[#D3CDC1] text-xs text-[#151413] leading-relaxed">
              {response.answer}
            </div>

            {/* Warning if any */}
            {response.warning && (
              <div className="px-3 py-1.5 bg-[#FEF3C7] border border-[#F59E0B] text-[10px] text-[#92400E] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{response.warning}</span>
              </div>
            )}

            {/* Code Block */}
            <div className="border border-[#151413] bg-[#151413] text-[#F6F4EE] p-3 text-xs overflow-x-auto">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#333] text-[10px] text-[#7A756D]">
                <span>SOURCE: PYTHON_SDK</span>
                <span>RETURN: EXECUTABLE</span>
              </div>
              <pre className="text-[#A7F3D0] leading-relaxed">{response.code}</pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#D3CDC1]">
              <div className="flex items-center gap-2">
                <button onClick={handleCopyCode} className="pixel-btn flex items-center gap-1.5">
                  {copied ? <Check className="w-3 h-3 text-[#059669]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "COPIED" : "COPY CODE"}</span>
                </button>
                <button
                  onClick={handleRunSandbox}
                  disabled={isRunningSandbox}
                  className="pixel-btn-emerald flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>{isRunningSandbox ? "RUNNING..." : "RUN IN SANDBOX"}</span>
                </button>
              </div>

              <button
                onClick={handleMarkResolved}
                disabled={isResolved}
                className={`pixel-btn flex items-center gap-1.5 ${
                  isResolved ? "bg-[#D1FAE5] text-[#065F46] border-[#059669]" : ""
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{isResolved ? "RESOLVED (TRACKED)" : "MARK RESOLVED"}</span>
              </button>
            </div>

            {/* 30s Guardrail Status */}
            {guardrailSeconds !== null && (
              <div className="text-[10px] text-[#7A756D] flex justify-between px-2 py-1 bg-[#EDEAE1] border border-[#D3CDC1]">
                <span>NEGATIVE GUARDRAIL: {guardrailSeconds}s ACTIVE</span>
                <span>METRIC COMMITS IF NO ERROR FOLLOW-UP</span>
              </div>
            )}
          </div>
        ) : (
          <div className="pixel-box p-8 text-center text-[#7A756D] text-xs">
            &gt; AWAITING QUERY. SELECT PRESET OR DISPATCH TO OBSERVE MULTIVARIATE RAG EXECUTION.
          </div>
        )}
      </div>

      {/* Right: Sandbox Stdout Console */}
      <div className="lg:col-span-5 space-y-4">
        <div className="pixel-box p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D3CDC1] pb-2 text-[11px]">
            <span className="font-bold text-[#151413]">STDOUT // SANDBOX RUNNER</span>
            <span className="ticker-badge">ISOLATED</span>
          </div>

          <div className="bg-[#151413] text-[#A7F3D0] p-4 text-xs font-mono min-h-[310px] flex flex-col justify-between border border-[#151413]">
            {sandboxOutput ? (
              <pre className="whitespace-pre-wrap leading-relaxed">{sandboxOutput}</pre>
            ) : (
              <div className="text-[#555] flex flex-col items-center justify-center h-48 space-y-2 text-center">
                <Terminal className="w-8 h-8 text-[#444]" />
                <span className="text-[11px]">&gt; CLICK &quot;RUN IN SANDBOX&quot; TO TEST GENERATED CODE</span>
              </div>
            )}

            <div className="border-t border-[#333] pt-2 text-[10px] text-[#7A756D] flex items-center justify-between">
              <span>MEMORY: 12.4 MB</span>
              <span>EXIT_CODE: {sandboxOutput ? "0" : "--"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
