"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { CopilotSandbox } from "@/components/CopilotSandbox";
import { SwarmSimulator } from "@/components/SwarmSimulator";
import { BayesianAnalytics } from "@/components/BayesianAnalytics";
import { CustomDocsManager } from "@/components/CustomDocsManager";
import { ToastStream } from "@/components/ToastStream";
import { FlagsmithEval, TelemetryEvent } from "@/lib/types";
import { fetchFlags } from "@/lib/api";

export default function Home() {
  const [currentIdentity, setCurrentIdentity] = useState<string>("user_8841f");
  const [flagsEval, setFlagsEval] = useState<FlagsmithEval | null>(null);
  const [activeTab, setActiveTab] = useState<"copilot" | "lab" | "custom_data">("copilot");
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [toasts, setToasts] = useState<TelemetryEvent[]>([]);

  useEffect(() => {
    loadIdentityFlags(currentIdentity);
  }, [currentIdentity]);

  const loadIdentityFlags = async (userId: string) => {
    setIsSwitching(true);
    try {
      const evaluation = await fetchFlags(userId);
      setFlagsEval(evaluation);

      addToast({
        id: Math.random().toString(),
        event: "EXPOSURE",
        identifier: userId,
        variant: evaluation.strategy,
        timestamp: Date.now() / 1000
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleNewSession = () => {
    const freshSuffix = Math.random().toString(36).substring(2, 7);
    const newId = `user_${freshSuffix}`;
    setCurrentIdentity(newId);
  };

  const addToast = (event: TelemetryEvent) => {
    setToasts((prev) => [event, ...prev.slice(0, 3)]);
    setTimeout(() => {
      dismissToast(event.id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col font-mono text-[#151413]">
      <Header
        currentIdentity={currentIdentity}
        flagsEval={flagsEval}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSession={handleNewSession}
        isSwitching={isSwitching}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-5 space-y-5">
        {/* Dynamic Views */}
        {activeTab === "copilot" && (
          <CopilotSandbox currentIdentity={currentIdentity} onEventTracked={addToast} />
        )}

        {activeTab === "lab" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#EFECE3] border-2 border-[#151413] shadow-[3px_3px_0px_#151413]">
              <div className="flex items-center gap-2">
                <span className="font-pixel-display text-xs font-bold bg-[#151413] text-[#F8F6F0] px-2 py-0.5">
                  EXPERIMENT LAB
                </span>
                <span className="text-xs text-[#575249]">
                  1,500 Developer Swarm &amp; Bayesian Beta posterior inference
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#151413]">
                CONFIDENCE: <span className="text-[#059669]">97.4% (VAR B WINNER)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <SwarmSimulator
                onSwarmCompleted={() => {
                  addToast({
                    id: Math.random().toString(),
                    event: "EVENT_TRACKED",
                    identifier: "swarm_worker",
                    metric: "1500_identities_ingested",
                    value: 263,
                    latency_ms: 1080,
                    timestamp: Date.now() / 1000
                  });
                }}
                onEventTracked={addToast}
              />

              <BayesianAnalytics
                onWinnerPromoted={() => {
                  loadIdentityFlags(currentIdentity);
                }}
                onEventTracked={addToast}
              />
            </div>
          </div>
        )}

        {activeTab === "custom_data" && <CustomDocsManager />}
      </main>

      <ToastStream events={toasts} onDismiss={dismissToast} />

      <footer className="border-t-2 border-[#151413] py-3 px-4 text-xs text-[#575249] bg-[#EFECE3]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#151413]">ROUTESMITH AI</span>
            <span>//</span>
            <span>FLAGSMITH BAYESIAN GATEWAY</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>SYSTEM: <strong className="text-[#059669]">ONLINE</strong></span>
            <span>TRAFFIC: <strong className="text-[#151413]">33/33/34</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
