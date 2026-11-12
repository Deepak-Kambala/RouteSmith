"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Bot,
  Send,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Code2,
  FolderGit2,
  GitBranch,
  Layers,
  Sparkles,
  ChevronRight,
  Terminal,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { ToolRun, ToolStatus } from "@/types";

interface Message {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: string;
  reasoning_summary?: string;
  tools?: ToolRun[];
  code_diff?: {
    file_path: string;
    original: string;
    modified: string;
  };
  requires_approval?: boolean;
  approval_status?: "pending" | "approved" | "rejected";
}

export default function AgentWorkspacePage() {
  const [sessions, setSessions] = useState([
    { id: "sess_1", title: "Simplify Signup Form (6 -> 3 fields)", active: true, time: "2h ago" },
    { id: "sess_2", title: "Sticky Trial Navbar CTA", active: false, time: "1d ago" },
    { id: "sess_3", title: "Pricing Annual Toggle Default", active: false, time: "3d ago" },
  ]);

  const [inputGoal, setInputGoal] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      sender: "user",
      content: "Increase signup conversion on my website by simplifying the registration flow.",
      timestamp: "10:14 AM",
    },
    {
      id: "msg_2",
      sender: "agent",
      content:
        "I have analyzed your connected repository `Deepak-Kambala/RouteSmith`. I located the active registration component at `src/components/SignupForm.tsx` and detected 6 form fields. Removing company firmographic fields from initial capture will reduce cognitive load and form dropoff.",
      timestamp: "10:14 AM",
      reasoning_summary:
        "Parsed AST component tree -> Identified 6 uncontrolled inputs in SignupForm.tsx -> Formulated 3-field treatment variant with post-signup progressive enrichment.",
      tools: [
        {
          id: "tool_1",
          tool_name: "analyze_repository",
          status: "completed",
          input_params: { repo: "Deepak-Kambala/RouteSmith", branch: "main" },
          output_summary: "Found 24 components, 8 routes. Targeted SignupForm.tsx",
          started_at: "10:14:02",
          completed_at: "10:14:04",
        },
        {
          id: "tool_2",
          tool_name: "identify_experiment_points",
          status: "completed",
          input_params: { file_path: "src/components/SignupForm.tsx" },
          output_summary: "Detected 6 input fields (name, email, password, company, company_size, role)",
          started_at: "10:14:04",
          completed_at: "10:14:06",
        },
        {
          id: "tool_3",
          tool_name: "generate_hypothesis",
          status: "completed",
          input_params: { goal: "Reduce signup form friction" },
          output_summary: "Hypothesis: 3-field form lifts completion rate by ~25%",
          started_at: "10:14:06",
          completed_at: "10:14:08",
        },
        {
          id: "tool_4",
          tool_name: "generate_code_patch",
          status: "completed",
          input_params: { component: "SignupForm.tsx", flag: "signup_form_simplification" },
          output_summary: "Prepared Flagsmith feature flag evaluation and conditional render",
          started_at: "10:14:08",
          completed_at: "10:14:10",
        },
        {
          id: "tool_5",
          tool_name: "create_feature_flag",
          status: "requires_approval",
          input_params: { flag_name: "signup_form_simplification", split: "50/50" },
          output_summary: "Awaiting human authorization to register flag in Flagsmith",
          started_at: "10:14:10",
        },
      ],
      code_diff: {
        file_path: "src/components/SignupForm.tsx",
        original: `// Control: 6 Fields
export function SignupForm() {
  return (
    <form onSubmit={handleRegister}>
      <input name="name" placeholder="Full Name" required />
      <input name="email" placeholder="Work Email" required />
      <input name="password" type="password" required />
      <input name="company" placeholder="Company Name" required />
      <input name="size" placeholder="Company Size" />
      <input name="role" placeholder="Job Role" />
      <button type="submit">Complete Registration</button>
    </form>
  );
}`,
        modified: `// Treatment: Flagsmith Multivariate Evaluation
import { useFlagsmith } from "flagsmith/react";

export function SignupForm({ userId }: { userId: string }) {
  const flagsmith = useFlagsmith();
  const isStreamlined = flagsmith.hasFeature("signup_form_simplification");

  return (
    <form onSubmit={handleRegister}>
      <input name="name" placeholder="Full Name" required />
      <input name="email" placeholder="Work Email" required />
      <input name="password" type="password" required />

      {/* Conditionally omitted in Treatment Variant B */}
      {!isStreamlined && (
        <>
          <input name="company" placeholder="Company Name" required />
          <input name="size" placeholder="Company Size" />
          <input name="role" placeholder="Job Role" />
        </>
      )}

      <button type="submit">
        {isStreamlined ? "Get Started (Fast)" : "Complete Registration"}
      </button>
    </form>
  );
}`,
      },
      requires_approval: true,
      approval_status: "pending",
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGoal.trim() || isProcessing) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      content: inputGoal,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputGoal("");
    setIsProcessing(true);

    setTimeout(() => {
      const agentReply: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: "agent",
        content: `I've processed your instructions regarding "${userMsg.content}". I have updated the experiment configuration and validated the AST diff.`,
        timestamp: "Just now",
        reasoning_summary: "Validated component props and updated metric definitions in Flagsmith schema.",
      };
      setMessages((prev) => [...prev, agentReply]);
      setIsProcessing(false);
    }, 1200);
  };

  const handleApproveCode = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              approval_status: "approved",
              tools: m.tools?.map((t) =>
                t.tool_name === "create_feature_flag"
                  ? { ...t, status: "completed", output_summary: "Flag created in Flagsmith (50/50 split)" }
                  : t
              ),
            }
          : m
      )
    );
  };

  const handleRejectCode = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              approval_status: "rejected",
              tools: m.tools?.map((t) =>
                t.tool_name === "create_feature_flag"
                  ? { ...t, status: "failed", output_summary: "Rejected by developer" }
                  : t
              ),
            }
          : m
      )
    );
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-128px)] flex flex-col md:flex-row gap-4">
        {/* LEFT COLUMN: Sessions & Connected Repo (approx 240px) */}
        <div className="w-full md:w-[240px] shrink-0 dev-card p-3.5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <span className="text-xs font-semibold text-[#111827]">Agent Sessions</span>
              <button
                onClick={() => {
                  setSessions([
                    { id: `sess_${Date.now()}`, title: "New Exploration Session", active: true, time: "Just now" },
                    ...sessions.map((s) => ({ ...s, active: false })),
                  ]);
                }}
                className="p-1 rounded-md text-[#3867F5] hover:bg-[#EFF4FF] transition-colors"
                title="New Session"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Session List */}
            <div className="space-y-1">
              {sessions.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() =>
                    setSessions(sessions.map((s) => ({ ...s, active: s.id === sess.id })))
                  }
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                    sess.active
                      ? "bg-[#EFF4FF] text-[#1E40AF] font-semibold"
                      : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827]"
                  }`}
                >
                  <span className="truncate">{sess.title}</span>
                  <span className="text-[10px] text-[#94A3B8] font-mono-code">{sess.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Connected Repo Indicator */}
          <div className="pt-3 border-t border-[#E5E7EB] text-xs">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold block mb-1">
              Connected Target
            </span>
            <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] flex items-center gap-2 truncate">
              <FolderGit2 className="w-4 h-4 text-[#3867F5] shrink-0" />
              <div className="truncate">
                <div className="text-xs font-semibold text-[#111827] truncate">RouteSmith</div>
                <div className="text-[10px] text-[#64748B] font-mono-code truncate">branch: main</div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive Chat & Tool Executions (Flex 1) */}
        <div className="flex-1 dev-card flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#3867F5] text-white flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-[#111827]">
                Experimentation Engineer (Gemini 2.0 runtime)
              </span>
            </div>
            <span className="text-[11px] font-mono-code text-[#16A36A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]"></span>
              Tool Calling Active
            </span>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "agent" && (
                  <div className="w-7 h-7 rounded-lg bg-[#EFF4FF] border border-[#BFDBFE] text-[#3867F5] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] space-y-3 ${
                    msg.sender === "user"
                      ? "p-3 rounded-xl bg-[#3867F5] text-white"
                      : "p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827]"
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>

                  {/* Concise Reasoning Summary */}
                  {msg.reasoning_summary && (
                    <div className="p-2.5 rounded-lg bg-[#EFF4FF] border border-[#BFDBFE] text-[11px] text-[#1E40AF] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#3867F5]" />
                        <span>Agent Reasoning Summary</span>
                      </div>
                      <p className="leading-relaxed">{msg.reasoning_summary}</p>
                    </div>
                  )}

                  {/* Tool Execution Cards */}
                  {msg.tools && msg.tools.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                        Tool Executions
                      </span>
                      <div className="space-y-1.5">
                        {msg.tools.map((tool) => (
                          <div
                            key={tool.id}
                            className="p-2 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-between text-xs font-mono-code"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {tool.status === "completed" && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A] shrink-0" />
                              )}
                              {tool.status === "requires_approval" && (
                                <ShieldAlert className="w-3.5 h-3.5 text-[#D99725] shrink-0" />
                              )}
                              {tool.status === "running" && (
                                <Clock className="w-3.5 h-3.5 text-[#3867F5] animate-spin shrink-0" />
                              )}
                              {tool.status === "failed" && (
                                <XCircle className="w-3.5 h-3.5 text-[#DC5555] shrink-0" />
                              )}
                              <span className="font-semibold text-[#111827]">{tool.tool_name}</span>
                              <span className="text-[#64748B] truncate text-[11px]">
                                — {tool.output_summary}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                                tool.status === "completed"
                                  ? "bg-[#F0FDF4] text-[#16A36A]"
                                  : tool.status === "requires_approval"
                                  ? "bg-[#FFFBEB] text-[#D99725]"
                                  : "bg-[#F8FAFC] text-[#64748B]"
                              }`}
                            >
                              {tool.status.replace("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Diff Viewer */}
                  {msg.code_diff && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-mono-code">
                        <span className="font-semibold text-[#111827] flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-[#3867F5]" />
                          <span>{msg.code_diff.file_path}</span>
                        </span>
                        <span className="text-[10px] text-[#64748B]">Synthesized Patch</span>
                      </div>

                      <div className="rounded-lg bg-[#111827] p-3 text-xs font-mono-code text-[#E5E7EB] overflow-x-auto max-h-56">
                        <pre className="text-[#A7F3D0] leading-relaxed">{msg.code_diff.modified}</pre>
                      </div>

                      {/* Approval Actions */}
                      {msg.requires_approval && msg.approval_status === "pending" && (
                        <div className="p-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-[#92400E]">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>Developer authorization required before applying patch &amp; creating flag.</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleRejectCode(msg.id)}
                              className="btn-secondary text-xs py-1 px-2.5 h-auto flex items-center gap-1 text-[#DC5555] hover:bg-[#FEF2F2]"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>

                            <button
                              onClick={() => handleApproveCode(msg.id)}
                              className="btn-primary text-xs py-1 px-3 h-auto flex items-center gap-1.5 bg-[#16A36A] hover:bg-[#15803D]"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve &amp; Deploy Flag</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {msg.approval_status === "approved" && (
                        <div className="p-2 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#16A36A] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Code change approved. Flagsmith flag `signup_form_simplification` created with 50/50 split.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E7EB] bg-white flex gap-2">
            <input
              type="text"
              value={inputGoal}
              onChange={(e) => setInputGoal(e.target.value)}
              placeholder="Give the agent an experimentation goal or ask follow-up questions..."
              className="dev-input text-xs"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!inputGoal.trim() || isProcessing}
              className="btn-primary text-xs px-4 flex items-center gap-1.5 font-semibold shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Working..." : "Send"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Repository Context & Detected Components (approx 280px) */}
        <div className="w-full md:w-[280px] shrink-0 dev-card p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider mb-2">
              Repository Context
            </h3>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Framework:</span>
                <span className="font-semibold text-[#111827]">Next.js 16 App Router</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Language:</span>
                <span className="font-semibold text-[#111827]">TypeScript + Python</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Commit Cache:</span>
                <span className="font-mono-code font-semibold text-[#3867F5]">11157e5</span>
              </div>
            </div>
          </div>

          {/* Detected Components Tree */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
              Detected AST Components
            </h3>
            <div className="space-y-1 text-xs">
              {[
                { name: "SignupForm.tsx", path: "src/components/SignupForm.tsx", active: true },
                { name: "PricingTable.tsx", path: "src/components/PricingTable.tsx", active: false },
                { name: "NavbarCTA.tsx", path: "src/components/NavbarCTA.tsx", active: false },
                { name: "OnboardingModal.tsx", path: "src/components/OnboardingModal.tsx", active: false },
              ].map((comp) => (
                <div
                  key={comp.name}
                  className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                    comp.active
                      ? "bg-[#EFF4FF] border-[#BFDBFE] text-[#1E40AF] font-medium"
                      : "bg-white border-[#E5E7EB] text-[#64748B]"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-semibold truncate">{comp.name}</div>
                    <div className="text-[10px] text-[#94A3B8] font-mono-code truncate">{comp.path}</div>
                  </div>
                  {comp.active && <span className="w-1.5 h-1.5 rounded-full bg-[#3867F5]"></span>}
                </div>
              ))}
            </div>
          </div>

          {/* Current Experiment Config */}
          <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
            <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
              Flagsmith Config
            </h3>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-xs space-y-1 font-mono-code">
              <div className="text-[11px] text-[#64748B]">FLAG KEY:</div>
              <div className="font-semibold text-[#111827]">signup_form_simplification</div>
              <div className="text-[11px] text-[#64748B] pt-1">SPLIT: 50% Control / 50% Treatment</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
