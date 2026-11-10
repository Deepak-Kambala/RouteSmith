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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#181716]">
      <Header
        currentIdentity={currentIdentity}
        flagsEval={flagsEval}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSession={handleNewSession}
        isSwitching={isSwitching}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Active Tab View */}
        {activeTab === "copilot" && (
          <CopilotSandbox currentIdentity={currentIdentity} onEventTracked={addToast} />
        )}

        {activeTab === "lab" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto pt-2 pb-1 space-y-2">
              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#181716]">
                Experimentation Lab &amp; Rollout
              </h1>
              <p className="text-sm text-[#6B665E]">
                Simulate large developer swarms, compute{" "}
                <span className="highlighter-brush font-medium text-[#181716]">Bayesian posterior probability</span>, and promote winners with 1 click.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
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

      <footer className="border-t border-[#E7E3DA] py-4 px-4 text-xs text-[#9C968B] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RouteSmith AI — Flagsmith Multivariate RAG Gateway</span>
          <span className="font-mono-code text-[11px]">System Status: Operational</span>
        </div>
      </footer>
    </div>
  );
}
