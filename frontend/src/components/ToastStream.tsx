"use client";

import React from "react";
import { Activity, CheckCircle2, X } from "lucide-react";
import { TelemetryEvent } from "@/lib/types";

interface ToastStreamProps {
  events: TelemetryEvent[];
  onDismiss: (id: string) => void;
}

export const ToastStream: React.FC<ToastStreamProps> = ({ events, onDismiss }) => {
  if (events.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-1.5 max-w-sm pointer-events-none select-none font-mono">
      {events.map((ev) => {
        const isExposure = ev.event === "EXPOSURE";
        return (
          <div
            key={ev.id}
            className="pointer-events-auto bg-[#151413] text-[#F6F4EE] p-2.5 border border-[#151413] shadow-[3px_3px_0px_#059669] text-[10px] space-y-1"
          >
            <div className="flex items-center justify-between border-b border-[#333] pb-1">
              <span className="font-bold text-[#A7F3D0]">
                FLAGSMITH // {ev.event}
              </span>
              <button
                onClick={() => onDismiss(ev.id)}
                className="text-[#7A756D] hover:text-white"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="text-[#EDEAE1] leading-tight">
              {isExposure ? (
                <>
                  ID <strong className="text-white">{ev.identifier}</strong> -&gt;{" "}
                  <strong className="text-[#FEF08A]">{ev.variant}</strong>
                </>
              ) : (
                <>
                  EVENT=&quot;<strong className="text-[#A7F3D0]">{ev.metric || "answer_resolved"}</strong>&quot; |
                  VAL={ev.value || 1} | {ev.latency_ms || 1080}ms
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
