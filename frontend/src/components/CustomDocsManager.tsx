"use client";

import React, { useState, useEffect } from "react";
import { Plus, RotateCcw, Check, BookOpen, FileText } from "lucide-react";
import { fetchDocs, addCustomDoc, resetDocs } from "@/lib/api";

const PRESET_DOCS = [
  {
    title: "Stripe Webhook Signature Verification in FastAPI",
    category: "Payments API",
    content: "To verify Stripe webhooks in FastAPI: read raw request body bytes via await request.body(). Pass signature header request.headers.get('stripe-signature') to stripe.Webhook.construct_event(payload, sig, endpoint_secret). Always return HTTP 200 immediately to prevent delivery retry storms."
  },
  {
    title: "Async Database Connection Pool & Context Management",
    category: "Database",
    content: "Use asyncpg or SQLAlchemy[asyncio] with create_async_engine(DATABASE_URL, pool_size=20, max_overflow=10). Yield session in FastAPI dependency: async with async_session() as session: yield session. Ensure pool pre-ping is enabled to recycle stale TCP connections."
  }
];

export const CustomDocsManager: React.FC = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Custom Data");
  const [content, setContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const res = await fetchDocs();
    if (res.docs) setDocs(res.docs);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsAdding(true);
    try {
      await addCustomDoc(title, content, category);
      setTitle("");
      setContent("");
      setSuccessMsg("Document indexed into RAG memory.");
      setTimeout(() => setSuccessMsg(null), 2500);
      await loadDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDocs();
      await loadDocs();
      setSuccessMsg("Reset to default Flagsmith corpus.");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const loadPreset = (p: typeof PRESET_DOCS[0]) => {
    setTitle(p.title);
    setCategory(p.category);
    setContent(p.content);
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-1 space-y-2">
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#181716]">
          Dynamic Knowledge Base
        </h1>
        <p className="text-sm text-[#6B665E]">
          Ingest custom technical documentation and API specifications directly into{" "}
          <span className="highlighter-brush font-medium text-[#181716]">active RAG memory</span>.
        </p>
      </div>

      <div className="clean-card p-6 max-w-4xl mx-auto space-y-5">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E3DA]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#059669]" />
            <span className="text-sm font-semibold text-[#181716]">
              Indexed Documents ({docs.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="tactile-btn text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              <span>Reset Corpus</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#9C968B] font-medium mr-1">Quick Presets:</span>
          {PRESET_DOCS.map((p) => (
            <button
              key={p.category}
              onClick={() => loadPreset(p)}
              className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E7E3DA] text-[#6B665E] hover:bg-[#F3EFE8] hover:text-[#181716] transition-all"
            >
              {p.category}
            </button>
          ))}
        </div>

        {/* Ingestion Form */}
        <form onSubmit={handleAdd} className="space-y-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E3DA]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title (e.g. Stripe Webhook Verification)"
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-white border border-[#E7E3DA] text-[#181716] placeholder-[#9C968B] focus:outline-none focus:border-[#181716]"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (e.g. Payments API)"
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-white border border-[#E7E3DA] text-[#181716] placeholder-[#9C968B] focus:outline-none focus:border-[#181716]"
              />
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste raw documentation text, code examples, or internal architecture notes..."
            rows={4}
            className="w-full px-3.5 py-2 text-xs rounded-lg bg-white border border-[#E7E3DA] text-[#181716] placeholder-[#9C968B] focus:outline-none focus:border-[#181716] leading-relaxed"
            required
          />

          <div className="flex items-center justify-between pt-1">
            {successMsg ? (
              <span className="text-xs text-[#059669] font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </span>
            ) : (
              <span className="text-xs text-[#9C968B]">
                All 3 RAG variants query against ingested chunks immediately.
              </span>
            )}

            <button
              type="submit"
              disabled={isAdding}
              className="tactile-btn tactile-btn-emerald py-1.5 px-4 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? "Indexing..." : "Ingest Document"}</span>
            </button>
          </div>
        </form>

        {/* Ingested Documents Grid */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold text-[#181716]">Active Knowledge Chunks</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
            {docs.map((d) => (
              <div key={d.id} className="p-3.5 rounded-xl bg-white border border-[#E7E3DA] text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#181716] truncate">{d.title}</span>
                  <span className="keycap-tag text-[10px]">{d.category}</span>
                </div>
                <p className="text-[#6B665E] text-[11px] leading-relaxed line-clamp-2">
                  {d.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
