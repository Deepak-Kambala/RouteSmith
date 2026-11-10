"use client";

import React, { useState } from "react";
import { Code, ChevronLeft, ChevronRight } from "lucide-react";

interface RoundNode {
  id: string;
  stage: string;
  name: string;
  sub: string;
  focal: boolean;
  payload: any;
}

const ROUNDS_FLOW = [
  {
    step: "01",
    label: "MULTIVARIATE SETUP",
    title: "Round 01: Configure Multivariate Flag",
    metricSummary: "Weights: Var A (33%) | Var B (33%) | Var C (34%)",
    nodes: [
      { id: "n1", stage: "01//INGRESS", name: "DEVELOPER CLIENT", sub: "identity_id", focal: false, payload: { identity: "user_8841f", traits: { tier: "pro" } } },
      { id: "n2", stage: "02//ROUTER", name: "ROUTESMITH ROUTER", sub: "get_identity_flags", focal: true, payload: { eval_feature: "rag_pipeline_strategy" } },
      { id: "n3", stage: "03//CONTROL", name: "FLAGSMITH SDK & API", sub: "33/33/34 traffic", focal: true, payload: { variant_a: 33, variant_b: 33, variant_c: 34 } },
      { id: "n4", stage: "04//EXECUTION", name: "RAG PIPELINES", sub: "top-3 vs hybrid vs cot", focal: false, payload: { loaded_strategies: 3 } },
      { id: "n5", stage: "05//WAREHOUSE", name: "MANAGED WAREHOUSE", sub: "schema init", focal: false, payload: { partition: "identity" } },
      { id: "n6", stage: "06//EVALUATOR", name: "BAYESIAN ENGINE", sub: "prior Beta(1,1)", focal: false, payload: { prior_alpha: 1, prior_beta: 1 } },
    ]
  },
  {
    step: "02",
    label: "METRIC BINDING",
    title: "Round 02: Bind Conversion Metric",
    metricSummary: "Metric: answer_resolved (copy code / sandbox / mark resolved)",
    nodes: [
      { id: "n1", stage: "01//INGRESS", name: "DEVELOPER CLIENT", sub: "track_event()", focal: true, payload: { trigger: "copy_code", metric: "answer_resolved" } },
      { id: "n2", stage: "02//ROUTER", name: "ROUTESMITH ROUTER", sub: "session guard 30s", focal: false, payload: { negative_guardrail: "active" } },
      { id: "n3", stage: "03//CONTROL", name: "FLAGSMITH SDK & API", sub: "metric binding", focal: true, payload: { event: "answer_resolved", value: 1 } },
      { id: "n4", stage: "04//EXECUTION", name: "RAG PIPELINES", sub: "telemetry hooks", focal: false, payload: { hooks: ["copy", "sandbox"] } },
      { id: "n5", stage: "05//WAREHOUSE", name: "MANAGED WAREHOUSE", sub: "ingesting events", focal: true, payload: { committed: "answer_resolved" } },
      { id: "n6", stage: "06//EVALUATOR", name: "BAYESIAN ENGINE", sub: "threshold N>=100", focal: false, payload: { min_sample: 100 } },
    ]
  },
  {
    step: "03",
    label: "SWARM INGESTION",
    title: "Round 03: Ingest 1,500 Synthetic Identities",
    metricSummary: "A: 11.2% (540ms) | B: 24.8% (1080ms) | C: 16.5% (2810ms)",
    nodes: [
      { id: "n1", stage: "01//INGRESS", name: "DEVELOPER CLIENT", sub: "1,500 identities", focal: true, payload: { simulated_count: 1500, personas: 3 } },
      { id: "n2", stage: "02//ROUTER", name: "ROUTESMITH ROUTER", sub: "500 / 500 / 500", focal: true, payload: { distribution: "33.3% equal hash" } },
      { id: "n3", stage: "03//CONTROL", name: "FLAGSMITH SDK & API", sub: "100% bucketed", focal: true, payload: { exposures_logged: 1500 } },
      { id: "n4", stage: "04//EXECUTION", name: "RAG PIPELINES", sub: "B leads: 24.8%", focal: true, payload: { a_conv: "11.2%", b_conv: "24.8%", c_conv: "16.5%" } },
      { id: "n5", stage: "05//WAREHOUSE", name: "MANAGED WAREHOUSE", sub: "263 conversions", focal: true, payload: { total_conversions: 263 } },
      { id: "n6", stage: "06//EVALUATOR", name: "BAYESIAN ENGINE", sub: "MCMC sampling", focal: true, payload: { iterations: 50000, winner: "var_b" } },
    ]
  },
  {
    step: "04",
    label: "BAYESIAN ROLLOUT",
    title: "Round 04: Promote Winner via Admin API",
    metricSummary: "P(B wins) = 97.4% -> Traffic Split updated to 0% / 100% / 0%",
    nodes: [
      { id: "n1", stage: "01//INGRESS", name: "DEVELOPER CLIENT", sub: "100% Variant B", focal: false, payload: { routing: "Variant B locked" } },
      { id: "n2", stage: "02//ROUTER", name: "ROUTESMITH ROUTER", sub: "winner locked", focal: true, payload: { weights: { a: 0, b: 100, c: 0 } } },
      { id: "n3", stage: "03//CONTROL", name: "FLAGSMITH SDK & API", sub: "0% / 100% / 0%", focal: true, payload: { admin_action: "PATCH /features/rag_pipeline_strategy" } },
      { id: "n4", stage: "04//EXECUTION", name: "RAG PIPELINES", sub: "Var B Production", focal: true, payload: { strategy: "clustered_hybrid_rag" } },
      { id: "n5", stage: "05//WAREHOUSE", name: "MANAGED WAREHOUSE", sub: "final snapshot", focal: false, payload: { state: "CONVERGED" } },
      { id: "n6", stage: "06//EVALUATOR", name: "BAYESIAN ENGINE", sub: "Win Prob = 97.4%", focal: true, payload: { win_prob: "97.4%", lift: "+121.4%" } },
    ]
  }
];

export const RoundNavigator: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedNode, setSelectedNode] = useState<RoundNode | null>(null);

  const activeRound = ROUNDS_FLOW[currentIdx];

  return (
    <div className="pixel-box p-5 space-y-4 font-mono select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D3CDC1] pb-3">
        <div>
          <span className="text-[10px] text-[#7A756D]">EXPERIMENTATION LIFECYCLE // STAGE {activeRound.step} OF 04</span>
          <h2 className="text-base font-bold text-[#151413] mt-0.5">{activeRound.title}</h2>
          <div className="text-[11px] text-[#059669] font-semibold mt-0.5">{activeRound.metricSummary}</div>
        </div>

        {/* Navigation Step Toggles */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
            disabled={currentIdx === 0}
            className="pixel-btn py-1 px-2.5 disabled:opacity-30"
          >
            &lt; PREV
          </button>
          <button
            onClick={() => setCurrentIdx((p) => Math.min(ROUNDS_FLOW.length - 1, p + 1))}
            disabled={currentIdx === ROUNDS_FLOW.length - 1}
            className="pixel-btn-primary py-1 px-2.5 disabled:opacity-30"
          >
            NEXT &gt;
          </button>
        </div>
      </div>

      {/* Stage Pills */}
      <div className="flex flex-wrap gap-1.5">
        {ROUNDS_FLOW.map((r, i) => (
          <button
            key={r.step}
            onClick={() => setCurrentIdx(i)}
            className={`text-[10px] px-2.5 py-1 border transition-all ${
              i === currentIdx
                ? "bg-[#151413] text-[#F6F4EE] border-[#151413] font-bold"
                : "bg-[#EDEAE1] text-[#7A756D] border-[#D3CDC1] hover:text-[#151413]"
            }`}
          >
            {r.step} // {r.label}
          </button>
        ))}
      </div>

      {/* Circuit Nodes Grid */}
      <div className="p-4 bg-[#EDEAE1] border border-[#D3CDC1] space-y-3">
        <div className="flex items-center justify-between text-[10px] text-[#7A756D]">
          <span>CLICK NODE TO INSPECT LIVE FLAGSMITH SDK PAYLOAD</span>
          <span className="text-[#059669] font-bold">* FOCAL ACTORS HIGHLIGHTED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {activeRound.nodes.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNode(n)}
              className={`p-3 border cursor-pointer transition-all ${
                n.focal
                  ? "bg-[#FFFFFF] border-[#151413] shadow-[2px_2px_0px_#059669]"
                  : "bg-[#F6F4EE] border-[#D3CDC1] hover:bg-[#FFFFFF]"
              } ${selectedNode?.id === n.id ? "ring-1 ring-[#151413]" : ""}`}
            >
              <div className="flex items-center justify-between text-[10px] text-[#7A756D]">
                <span>{n.stage}</span>
                <span className={`w-2 h-2 ${n.focal ? "bg-[#059669]" : "bg-[#D3CDC1]"}`}></span>
              </div>
              <div className="font-bold text-xs text-[#151413] mt-1">{n.name}</div>
              <div className="text-[10px] text-[#2563EB] mt-0.5">{n.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Payload Inspector */}
      {selectedNode && (
        <div className="p-3 bg-[#151413] text-[#A7F3D0] border border-[#151413] text-xs">
          <div className="flex items-center justify-between border-b border-[#333] pb-1.5 mb-2 text-[10px] text-[#7A756D]">
            <span>PAYLOAD: {selectedNode.name}</span>
            <button onClick={() => setSelectedNode(null)} className="text-[#A39E94] hover:text-white underline">
              [CLOSE]
            </button>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed">
            {JSON.stringify(selectedNode.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
