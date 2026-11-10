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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none font-mono">
      {events.map((ev) => {
        const isExposure = ev.event === "EXPOSURE";
        return (
          <div
            key={ev.id}
            className="pointer-events-auto bg-[#151413] text-[#F8F6F0] p-3 border-2 border-[#151413] shadow-[3px_3px_0px_#059669] text-xs space-y-1.5 transition-all"
          >
            <div className="flex items-center justify-between border-b border-[#2D2A26] pb-1">
              <span className="text-[11px] font-bold text-[#A7F3D0] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#059669]" />
                <span>FLAGSMITH // {ev.event}</span>
              </span>
              <button
                onClick={() => onDismiss(ev.id)}
                className="text-[#8A8376] hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs text-[#EFECE3] leading-snug">
              {isExposure ? (
                <>
                  ID <strong className="text-white">{ev.identifier}</strong> -&gt;{" "}
                  <strong className="text-[#FBBF24]">{ev.variant}</strong>
                </>
              ) : (
                <>
                  EVENT: <strong className="text-[#A7F3D0]">{ev.metric || "answer_resolved"}</strong>{" "}
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
