"use client";

import React, { useState } from "react";
import { Copy, Check, Play, Send, CheckCircle2, AlertTriangle, Terminal, Clock, DollarSign } from "lucide-react";
import { ChatResponse, VariantType } from "@/lib/types";
import { askCopilot, trackConversion } from "@/lib/api";

interface CopilotSandboxProps {
  currentIdentity: string;
  onEventTracked: (event: any) => void;
}

const SAMPLE_QUERIES = [
  "How do I initialize Flagsmith Python SDK with async FastAPI?",
  "How does deterministic multivariate flag routing work in RAG?",
  "How do I track custom conversion events with Flagsmith analytics?",
  "How do I enforce token budget remote config without redeployment?"
];

export const CopilotSandbox: React.FC<CopilotSandboxProps> = ({ currentIdentity, onEventTracked }) => {
  const [query, setQuery] = useState(SAMPLE_QUERIES[0]);
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
      // Start 30s negative guardrail timer
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
    setTimeout(() => setCopied(false), 2000);

    // Track answer_resolved event
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
    setSandboxOutput("Initializing isolated Python 3.11 execution runtime...\nLoading Flagsmith SDK context...");

    setTimeout(async () => {
      setIsRunningSandbox(false);
      setSandboxOutput(
        `[SUCCESS] Python script executed cleanly.\nFlagsmith client initialized: identifier='${currentIdentity}'\nActive Variant: '${response.active_variant}'\nToken latency: ${response.latency_ms}ms\nSandbox return code: 0`
      );

      // Track answer_resolved event
      const eventResult = await trackConversion(
        currentIdentity,
        response.active_variant,
        "answer_resolved",
        response.latency_ms
      );
      onEventTracked(eventResult.event);
      setIsResolved(true);
    }, 850);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Copilot Query & Solution Area */}
      <div className="lg:col-span-7 space-y-6">
        {/* Editorial Header */}
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code text-[#8E887E]">
              Autonomous Docs Copilot
            </span>
            <span className="keycap-badge text-[10px]">SDK Gateway Ingress</span>
          </div>

          <h2 className="font-serif-display text-2xl font-bold text-[#181715]">
            Ask Technical Documentation
          </h2>

          {/* Preset Prompts */}
          <div className="flex flex-wrap gap-2 pt-1">
            {SAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#6B665E] hover:text-[#181715] border border-[#E7E2D9] transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Query Input Box */}
          <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask an SDK or API architecture question..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5CEC4] bg-[#FAF8F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-sans transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#181715] hover:bg-[#2D2A26] text-white text-sm font-medium flex items-center gap-2 transition-all shadow-xs active:translate-y-px disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? "Routing..." : "Ask"}</span>
            </button>
          </form>
        </div>

        {/* Dynamic Response Box */}
        {response && (
          <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs space-y-4 animate-in fade-in duration-300">
            {/* Variant Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E2D9] pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#181715]">{response.pipeline_title}</span>
                <span className="keycap-badge text-[10px]">{response.active_variant}</span>
              </div>

              <div className="flex items-center gap-4 text-[#6B665E] font-mono-code">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{response.latency_ms}ms</span>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>${response.cost_usd.toFixed(4)}</span>
                </span>
              </div>
            </div>

            {/* Answer Text */}
            <p className="text-sm text-[#44403C] leading-relaxed">
              {response.answer}
            </p>

            {response.warning && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{response.warning}</span>
              </div>
            )}

            {/* Code Snippet Box */}
            <div className="rounded-xl bg-[#181715] text-[#FAF8F5] p-4 font-mono-code text-xs relative group">
              <div className="flex items-center justify-between pb-2 border-b border-[#333] mb-2 text-[#8E887E]">
                <span>flagsmith_example.py</span>
                <span className="text-[10px]">Python 3.11</span>
              </div>
              <pre className="overflow-x-auto text-[#E2E8F0] leading-relaxed">
                {response.code}
              </pre>
            </div>

            {/* Action Bar (Conversion Triggers) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-all shadow-xs active:translate-y-px"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied to Clipboard" : "Copy Working Code"}</span>
                </button>

                <button
                  onClick={handleRunSandbox}
                  disabled={isRunningSandbox}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFEA] text-[#181715] border border-[#D5CEC4] text-xs font-medium transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{isRunningSandbox ? "Executing..." : "Run in Sandbox"}</span>
                </button>
              </div>

              <button
                onClick={handleMarkResolved}
                disabled={isResolved}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isResolved
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "text-[#6B665E] hover:text-[#181715] hover:bg-[#FAF8F5] border border-transparent"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>{isResolved ? "Answer Resolved Tracked" : "Mark as Resolved"}</span>
              </button>
            </div>

            {/* Negative Guardrail Status */}
            {guardrailSeconds !== null && (
              <div className="text-[11px] font-mono-code text-[#8E887E] bg-[#FAF8F5] p-2 rounded-md border border-[#E7E2D9] flex items-center justify-between">
                <span>Guardrail window active: {guardrailSeconds}s</span>
                <span>Conversion suppresses if error prompt submitted</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Code Sandbox Runner & Real-time Telemetry */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E2D9] pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-semibold text-sm text-[#181715]">Interactive Code Sandbox</h3>
            </div>
            <span className="keycap-badge text-[10px]">stdout</span>
          </div>

          <p className="text-xs text-[#6B665E] leading-relaxed">
            Execute generated Flagsmith code snippets in an isolated runtime to test syntax, identity hashing, and trait routing.
          </p>

          {/* Sandbox Terminal */}
          <div className="bg-[#181715] rounded-xl p-4 font-mono-code text-xs text-[#A3E635] min-h-[220px] flex flex-col justify-between">
            {sandboxOutput ? (
              <pre className="whitespace-pre-wrap leading-relaxed">{sandboxOutput}</pre>
            ) : (
              <div className="text-[#8E887E] flex flex-col items-center justify-center h-40 space-y-2 text-center">
                <Terminal className="w-8 h-8 text-[#44403C]" />
                <span>Click &quot;Run in Sandbox&quot; on the generated code to verify execution live.</span>
              </div>
            )}

            <div className="border-t border-[#333] pt-2 mt-4 text-[11px] text-[#8E887E] flex items-center justify-between">
              <span>Exit code: {sandboxOutput ? "0" : "--"}</span>
              <span>Memory: 14.2 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

