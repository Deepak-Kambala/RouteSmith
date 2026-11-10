"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { RoundNavigator } from "@/components/RoundNavigator";
import { CopilotSandbox } from "@/components/CopilotSandbox";
import { SwarmSimulator } from "@/components/SwarmSimulator";
import { BayesianAnalytics } from "@/components/BayesianAnalytics";
import { ToastStream } from "@/components/ToastStream";
import { FlagsmithEval, TelemetryEvent } from "@/lib/types";
import { fetchFlags } from "@/lib/api";

export default function Home() {
  const [currentIdentity, setCurrentIdentity] = useState<string>("user_8841f");
  const [flagsEval, setFlagsEval] = useState<FlagsmithEval | null>(null);
  const [activeTab, setActiveTab] = useState<"copilot" | "rounds" | "simulator" | "analytics">("copilot");
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
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col font-mono text-[#151413]">
      {/* Header Deck */}
      <Header
        currentIdentity={currentIdentity}
        flagsEval={flagsEval}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSession={handleNewSession}
        isSwitching={isSwitching}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5 space-y-4">
        {/* Compact System Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#EDEAE1] border border-[#151413] text-[10px] text-[#7A756D]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#151413]">&gt; ROUTER_MODE: MULTIVARIATE</span>
            <span>|</span>
            <span>CACHE: <strong className="text-[#059669]">ENABLED</strong></span>
            <span>|</span>
            <span>MAX_TOKENS: <strong className="text-[#151413]">2048</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span>SPLIT: <strong className="text-[#151413]">33 / 33 / 34</strong></span>
            <span>|</span>
            <span>METRIC: <strong className="text-[#059669]">answer_resolved</strong></span>
          </div>
        </div>

        {/* View Switching */}
        {activeTab === "copilot" && (
          <CopilotSandbox currentIdentity={currentIdentity} onEventTracked={addToast} />
        )}

        {activeTab === "rounds" && <RoundNavigator />}

        {activeTab === "simulator" && (
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
        )}

        {activeTab === "analytics" && (
          <BayesianAnalytics
            onWinnerPromoted={() => {
              loadIdentityFlags(currentIdentity);
            }}
            onEventTracked={addToast}
          />
        )}
      </main>

      {/* Real-time Telemetry Toast Stream */}
      <ToastStream events={toasts} onDismiss={dismissToast} />

      {/* Compact Status Footer */}
      <footer className="border-t-[1.5px] border-[#151413] py-2 px-4 text-center text-[10px] text-[#7A756D] bg-[#EDEAE1]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>ROUTESMITH AI // FLAGSMITH TRACK 01</span>
          <span>FASTAPI + NEXT.JS // ZERO AI SLOP</span>
          <span>ONLINE</span>
        </div>
      </footer>
    </div>
  );
}
