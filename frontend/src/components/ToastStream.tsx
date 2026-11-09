"use client";

import React from "react";
import { Activity, CheckCircle2, Shield, X } from "lucide-react";
import { TelemetryEvent } from "@/lib/types";

interface ToastStreamProps {
  events: TelemetryEvent[];
  onDismiss: (id: string) => void;
}

export const ToastStream: React.FC<ToastStreamProps> = ({ events, onDismiss }) => {
  if (events.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      {events.map((ev) => {
        const isExposure = ev.event === "EXPOSURE";
        return (
          <div
            key={ev.id}
            className="pointer-events-auto bg-[#181715] text-[#FAF8F5] p-3.5 rounded-xl border border-[#333] shadow-lg animate-in slide-in-from-bottom-3 duration-200 text-xs font-mono-code space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isExposure ? (
                  <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                )}
                <span className="font-bold tracking-wider text-[11px] text-[#FEF08A]">
                  FLAGSMITH {ev.event}
                </span>
              </div>
              <button
                onClick={() => onDismiss(ev.id)}
                className="text-[#8E887E] hover:text-white"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[#E2E8F0] text-[11px] leading-relaxed">
              {isExposure ? (
                <>
                  Identity <span className="text-white font-semibold">{ev.identifier}</span> evaluated{" "}
                  <span className="text-[#93C5FD]">rag_pipeline_strategy</span> -&gt;{" "}
                  <span className="text-[#FEF08A] font-semibold">{ev.variant}</span>
                </>
              ) : (
                <>
                  metric=&quot;<span className="text-[#A7F3D0]">{ev.metric || "answer_resolved"}</span>&quot; |
                  value={ev.value || 1} | latency_ms={ev.latency_ms || 1080}
                </>
              )}
            </div>

            <div className="text-[10px] text-[#8E887E] text-right">
              {new Date(ev.timestamp * 1000).toLocaleTimeString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};
