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

      // Trigger exposure toast
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
    }, 5500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#181715]">
      {/* Tactile Header with Identity HUD */}
      <Header
        currentIdentity={currentIdentity}
        flagsEval={flagsEval}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSession={handleNewSession}
        isSwitching={isSwitching}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Editorial Hero Banner (LocalFlow style) */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono-code text-[#6B665E]">
            <span className="w-2 h-2 rounded-full bg-[#E04F34]"></span>
            <span>YOUR DOCS. YOUR ROUTER. YOUR CODE.</span>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#181715] leading-[1.15]">
            Think it. Ask it.{" "}
            <span className="highlighter-brush italic font-normal">There it is.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#6B665E] max-w-2xl mx-auto leading-relaxed">
            A self-optimizing LLM gateway that tests which RAG topology maximizes developer code resolution.
            Powered by Flagsmith multivariate flags and Bayesian Beta-Binomial convergence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono-code text-[#6B665E]">
            <span className="keycap-badge">fn</span>
            <span>or</span>
            <span className="keycap-badge">right ⌥</span>
            <span>Hold. Query. Resolve.</span>
            <span className="text-[#D5CEC4]">/</span>
            <span>Zero AI Slop. 100% Bayesian Confidence.</span>
          </div>
        </section>

        {/* Tab View Switching */}
        {activeTab === "copilot" && (
          <CopilotSandbox
            currentIdentity={currentIdentity}
            onEventTracked={addToast}
          />
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

      {/* Real-time Telemetry Toast Stream in bottom-right */}
      <ToastStream events={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="border-t border-[#E7E2D9] py-6 text-center text-xs font-mono-code text-[#8E887E] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>RouteSmith AI - Flagsmith Hackathon Track 01</span>
          <span>FastAPI Backend + Next.js 15 App Router</span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
