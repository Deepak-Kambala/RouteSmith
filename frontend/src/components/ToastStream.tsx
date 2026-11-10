"use client";

import React from "react";
import { X, Activity } from "lucide-react";
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
            className="pointer-events-auto bg-[#181716] text-[#FAF8F5] p-3 rounded-xl border border-[#2D2A26] shadow-lg text-xs font-mono-code space-y-1.5 transition-all"
          >
            <div className="flex items-center justify-between border-b border-[#2D2A26] pb-1.5">
              <span className="text-[11px] font-semibold text-[#A7F3D0] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#059669]" />
                <span>Flagsmith: {ev.event}</span>
              </span>
              <button
                onClick={() => onDismiss(ev.id)}
                className="text-[#9C968B] hover:text-white p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs text-[#E7E3DA] leading-snug">
              {isExposure ? (
                <>
                  Identity <span className="text-white font-medium">{ev.identifier}</span> assigned to{" "}
                  <span className="text-[#FDE68A] font-medium">{ev.variant}</span>
                </>
              ) : (
                <>
                  Event: <span className="text-[#A7F3D0] font-medium">{ev.metric || "answer_resolved"}</span>{" "}
                  ({ev.latency_ms || 1080}ms)
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
