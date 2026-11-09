"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Code, Eye, Layers } from "lucide-react";

interface RoundInfo {
  roundNumber: number;
  badge: string;
  title: string;
  description: string;
  pills: string[];
  activeActorIndex: number[];
  nodes: {
    id: string;
    title: string;
    subtitle: string;
    stage: string;
    status: string;
    jsonPayload: any;
  }[];
}

const ROUNDS_DATA: RoundInfo[] = [
  {
    roundNumber: 1,
    badge: "ROUND 01 / 04  Multivariate Flag Setup",
    title: "Round 1: Create Multivariate Flag",
    description:
      "Flag rag_pipeline_strategy is configured in Flagsmith Cloud with three control/treatment weights: Variant A (fast_zero_shot: 33%), Variant B (clustered_hybrid_rag: 33%), and Variant C (agentic_self_reflection: 34%).",
    pills: ["01 - Multivariate Flag", "02 - Conversion Metric", "03 - Traffic & Ingestion", "04 - Bayesian Winner"],
    activeActorIndex: [1, 2], // RouteSmith Router, Flagsmith SDK
    nodes: [
      {
        id: "node_01",
        title: "Developer Client UI",
        subtitle: "identity_id",
        stage: "01 - Ingress",
        status: "ready",
        jsonPayload: {
          identifier: "user_8841f",
          traits: { user_tier: "pro", region: "us-east" },
          event: "IDENTIFY"
        }
      },
      {
        id: "node_02",
        title: "RouteSmith Router",
        subtitle: "get_identity_flags",
        stage: "02 - Orchestrator",
        status: "active",
        jsonPayload: {
          method: "get_identity_flags",
          params: { identifier: "user_8841f", traits: { user_tier: "pro" } },
          target_feature: "rag_pipeline_strategy"
        }
      },
      {
        id: "node_03",
        title: "Flagsmith SDK & API",
        subtitle: "rag_pipeline_strategy",
        stage: "03 - Control Plane",
        status: "focal",
        jsonPayload: {
          feature_state: "MULTIVARIATE",
          variants: [
            { value: "fast_zero_shot", percentage_allocation: 33 },
            { value: "clustered_hybrid_rag", percentage_allocation: 33 },
            { value: "agentic_self_reflection", percentage_allocation: 34 }
          ],
          default_fallback: "clustered_hybrid_rag"
        }
      },
      {
        id: "node_04",
        title: "RAG Variants A/B/C",
        subtitle: "33% / 33% / 34%",
        stage: "04 - Execution",
        status: "awaiting",
        jsonPayload: {
          variant_a: "top-3 vector fast prompt",
          variant_b: "semantic clustering + BM25",
          variant_c: "agentic critic AST loop"
        }
      },
      {
        id: "node_05",
        title: "Managed Warehouse",
        subtitle: "schema ready",
        stage: "05 - Telemetry Store",
        status: "ready",
        jsonPayload: {
          tables: ["flagsmith_exposures", "flagsmith_events"],
          partition_key: "identifier"
        }
      },
      {
        id: "node_06",
        title: "Bayesian Engine",
        subtitle: "prior Beta(1,1)",
        stage: "06 - Evaluator",
        status: "awaiting",
        jsonPayload: {
          prior_alpha: 1.0,
          prior_beta: 1.0,
          sampling_engine: "Monte Carlo MCMC"
        }
      }
    ]
  },
  {
    roundNumber: 2,
    badge: "ROUND 02 / 04  Conversion Metric Instrumentation",
    title: "Round 2: Pick Conversion Metric",
    description:
      "Conversion event answer_resolved is hooked to the Developer Client UI and triggered when a developer copies generated code or marks an answer resolved without a follow-up error.",
    pills: ["01 - Multivariate Flag", "02 - Conversion Metric", "03 - Traffic & Ingestion", "04 - Bayesian Winner"],
    activeActorIndex: [0, 2, 4], // Developer UI, Flagsmith SDK, Managed Warehouse
    nodes: [
      {
        id: "node_01",
        title: "Developer Client UI",
        subtitle: "track_event()",
        stage: "01 - Ingress",
        status: "focal",
        jsonPayload: {
          action: "click_copy_code",
          dispatch_event: "answer_resolved",
          guardrail_window_sec: 30
        }
      },
      {
        id: "node_02",
        title: "RouteSmith Router",
        subtitle: "session guard",
        stage: "02 - Orchestrator",
        status: "active",
        jsonPayload: {
          latency_ms: 1080,
          error_subsequent: false,
          verified_resolved: true
        }
      },
      {
        id: "node_03",
        title: "Flagsmith SDK & API",
        subtitle: "metric binding",
        stage: "03 - Control Plane",
        status: "focal",
        jsonPayload: {
          method: "track_event",
          event_name: "answer_resolved",
          identifier: "user_8841f",
          value: 1
        }
      },
      {
        id: "node_04",
        title: "RAG Variants A/B/C",
        subtitle: "telemetry hooks",
        stage: "04 - Execution",
        status: "active",
        jsonPayload: {
          hooks_attached: ["code_copied", "sandbox_executed", "feedback_positive"]
        }
      },
      {
        id: "node_05",
        title: "Managed Warehouse",
        subtitle: "answer_resolved",
        stage: "05 - Telemetry Store",
        status: "focal",
        jsonPayload: {
          recorded_metric: "answer_resolved",
          variant: "clustered_hybrid_rag",
          status: "COMMITTED"
        }
      },
      {
        id: "node_06",
        title: "Bayesian Engine",
        subtitle: "awaiting N>=100",
        stage: "06 - Evaluator",
        status: "awaiting",
        jsonPayload: {
          min_sample_threshold: 100,
          current_sample_size: 48
        }
      }
    ]
  },
  {
    roundNumber: 3,
    badge: "ROUND 03 / 04  Live Traffic Split & Telemetry Ingestion",
    title: "Round 3: Split Traffic & Ingest Events",
    description:
      "1,500 simulated developer identities are evaluated across the 3 RAG pipelines: Variant A achieves 11.2% conversion (540ms), Variant B leads at 24.8% conversion (1080ms), and Variant C reaches 16.5% conversion (2810ms).",
    pills: ["01 - Multivariate Flag", "02 - Conversion Metric", "03 - Traffic & Ingestion", "04 - Bayesian Winner"],
    activeActorIndex: [0, 1, 2, 3, 4],
    nodes: [
      {
        id: "node_01",
        title: "Developer Client UI",
        subtitle: "1,500 identities",
        stage: "01 - Ingress",
        status: "active",
        jsonPayload: {
          total_sessions: 1500,
          concurrency: 50,
          personas: ["Impatient Hacker", "Senior Architect", "Pragmatic Builder"]
        }
      },
      {
        id: "node_02",
        title: "RouteSmith Router",
        subtitle: "500 / 500 / 500",
        stage: "02 - Orchestrator",
        status: "active",
        jsonPayload: {
          distribution: { fast_zero_shot: 500, clustered_hybrid_rag: 500, agentic_self_reflection: 500 }
        }
      },
      {
        id: "node_03",
        title: "Flagsmith SDK & API",
        subtitle: "100% bucketed",
        stage: "03 - Control Plane",
        status: "focal",
        jsonPayload: {
          total_evaluations: 1500,
          hash_algorithm: "deterministic_modulo_100",
          exposure_delivery: "100% SUCCESS"
        }
      },
      {
        id: "node_04",
        title: "RAG Variants A/B/C",
        subtitle: "B leads: 24.8%",
        stage: "04 - Execution",
        status: "focal",
        jsonPayload: {
          variant_a: { exposures: 500, conversions: 56, rate: "11.2%" },
          variant_b: { exposures: 500, conversions: 124, rate: "24.8%" },
          variant_c: { exposures: 500, conversions: 83, rate: "16.5%" }
        }
      },
      {
        id: "node_05",
        title: "Managed Warehouse",
        subtitle: "263 conversions",
        stage: "05 - Telemetry Store",
        status: "focal",
        jsonPayload: {
          total_conversions_ingested: 263,
          overall_conversion_rate: "17.53%"
        }
      },
      {
        id: "node_06",
        title: "Bayesian Engine",
        subtitle: "sampling MCMC",
        stage: "06 - Evaluator",
        status: "active",
        jsonPayload: {
          samples: 50000,
          variant_b_dominance_ratio: 0.974
        }
      }
    ]
  },
  {
    roundNumber: 4,
    badge: "ROUND 04 / 04  Bayesian Evaluation & Winner Rollout",
    title: "Round 4: Bayesian Evaluation & Winner Rollout",
    description:
      "Flagsmith Bayesian Engine computes a 97.4% Win Probability for Variant B (+121.4% relative lift over baseline) and automatically updates traffic weights to 0% / 100% / 0% via the Flagsmith Admin API.",
    pills: ["01 - Multivariate Flag", "02 - Conversion Metric", "03 - Traffic & Ingestion", "04 - Bayesian Winner"],
    activeActorIndex: [1, 2, 3, 5], // Router, SDK, Variants, Bayesian Engine
    nodes: [
      {
        id: "node_01",
        title: "Developer Client UI",
        subtitle: "100% Variant B",
        stage: "01 - Ingress",
        status: "ready",
        jsonPayload: {
          all_future_traffic: "Variant B (clustered_hybrid_rag)"
        }
      },
      {
        id: "node_02",
        title: "RouteSmith Router",
        subtitle: "winner locked",
        stage: "02 - Orchestrator",
        status: "active",
        jsonPayload: {
          traffic_override: { fast_zero_shot: 0, clustered_hybrid_rag: 100, agentic_self_reflection: 0 }
        }
      },
      {
        id: "node_03",
        title: "Flagsmith SDK & API",
        subtitle: "0% / 100% / 0%",
        stage: "03 - Control Plane",
        status: "focal",
        jsonPayload: {
          admin_action: "PATCH /features/rag_pipeline_strategy/",
          new_multivariate_weights: {
            fast_zero_shot: 0,
            clustered_hybrid_rag: 100,
            agentic_self_reflection: 0
          },
          status: "PRODUCTION_ACTIVE"
        }
      },
      {
        id: "node_04",
        title: "RAG Variants A/B/C",
        subtitle: "Variant B 100%",
        stage: "04 - Execution",
        status: "focal",
        jsonPayload: {
          active_pipeline: "clustered_hybrid_rag",
          mean_latency_ms: 1080,
          resolution_rate: "24.8%"
        }
      },
      {
        id: "node_05",
        title: "Managed Warehouse",
        subtitle: "final snapshot",
        stage: "05 - Telemetry Store",
        status: "ready",
        jsonPayload: {
          conversions_final: 263,
          experiment_state: "CONVERGED_WINNER_ROLLED_OUT"
        }
      },
      {
        id: "node_06",
        title: "Bayesian Engine",
        subtitle: "P(B wins)=97.4%",
        stage: "06 - Evaluator",
        status: "focal",
        jsonPayload: {
          win_probability_pct: 97.4,
          relative_lift_pct: 121.4,
          beta_posterior_variant_b: { alpha: 125, beta: 377 }
        }
      }
    ]
  }
];

export const RoundNavigator: React.FC = () => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const round = ROUNDS_DATA[currentRoundIndex];

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2D9] shadow-xs p-6 md:p-8 space-y-6">
      {/* Top Header with navigation & stage pills */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E7E2D9] pb-5">
        <div>
          <span className="text-xs font-mono-code font-semibold tracking-wider text-[#E04F34] uppercase">
            {round.badge}
          </span>
          <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-[#181715] mt-1">
            {round.title}
          </h2>
          <p className="text-sm text-[#6B665E] max-w-3xl mt-1.5 leading-relaxed">
            {round.description}
          </p>
        </div>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => setCurrentRoundIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentRoundIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7E2D9] text-xs font-medium text-[#44403C] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={() => setCurrentRoundIndex((prev) => Math.min(ROUNDS_DATA.length - 1, prev + 1))}
            disabled={currentRoundIndex === ROUNDS_DATA.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E7E2D9] bg-[#181715] text-white text-xs font-medium hover:bg-[#2D2A26] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Round Selection Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {round.pills.map((pill, idx) => {
          const isActive = idx === currentRoundIndex;
          return (
            <button
              key={pill}
              onClick={() => setCurrentRoundIndex(idx)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono-code transition-all ${
                isActive
                  ? "bg-[#2563EB] text-white font-semibold shadow-xs"
                  : "bg-[#F3EFEA] text-[#6B665E] hover:text-[#181715] hover:bg-[#EBE6DF] border border-[#E7E2D9]"
              }`}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* Interactive Architecture Flowchart Diagram */}
      <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E7E2D9] space-y-6">
        <div className="text-xs font-mono-code text-[#8E887E] flex items-center justify-between">
          <span>Click any node to inspect raw Flagsmith SDK payload</span>
          <span className="text-[#E04F34] font-medium">* Active Round Actors Highlighted</span>
        </div>

        {/* 6 Node Diagram Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {round.nodes.map((node, idx) => {
            const isFocal = round.activeActorIndex.includes(idx);
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`cursor-pointer rounded-xl p-4 transition-all border text-left ${
                  isFocal
                    ? "bg-white border-[#2563EB] shadow-sm ring-2 ring-[#2563EB]/10"
                    : "bg-[#F5F3EF]/60 border-[#E7E2D9] hover:bg-white hover:border-[#D5CEC4]"
                } ${isSelected ? "ring-2 ring-[#181715]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono-code text-[#8E887E]">
                    {node.stage}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isFocal ? "bg-[#2563EB] animate-pulse" : "bg-[#D5CEC4]"
                    }`}
                  ></span>
                </div>
                <h4 className="font-semibold text-sm text-[#181715] mt-1">
                  {node.title}
                </h4>
                <div className="font-mono-code text-xs text-[#2563EB] mt-0.5">
                  {node.subtitle}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Flow Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono-code text-[#6B665E] pt-2 border-t border-[#E7E2D9]/70">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
            <span>Focal Round Actors</span>
          </div>
          <span className="text-[#D5CEC4]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#6B665E]"></span>
            <span>Deterministic SDK Evaluation Payload</span>
          </div>
          <span className="text-[#D5CEC4]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#10B981] font-bold">100%</span>
            <span>Bayesian Certainty Target</span>
          </div>
        </div>
      </div>

      {/* JSON Payload Inspection Drawer */}
      {selectedNode && (
        <div className="rounded-xl bg-[#181715] text-[#FAF8F5] p-5 space-y-3 font-mono-code text-xs">
          <div className="flex items-center justify-between border-b border-[#333] pb-2">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#FEF08A]" />
              <span className="font-semibold text-white">
                SDK Payload: {selectedNode.title} ({selectedNode.stage})
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[#8E887E] hover:text-white text-xs underline"
            >
              Close
            </button>
          </div>
          <pre className="overflow-x-auto text-[#A3E635] p-2 leading-relaxed">
            {JSON.stringify(selectedNode.jsonPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

