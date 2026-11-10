"use client";

import React, { useState, useEffect } from "react";
import { Plus, RotateCcw, Check, BookOpen } from "lucide-react";
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
      setSuccessMsg("DOCUMENT INDEXED INTO RAG MEMORY.");
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
      setSuccessMsg("RESET TO DEFAULT CORPUS.");
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
    <div className="space-y-5">
      {/* Sleek Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#EFECE3] border-2 border-[#151413] shadow-[3px_3px_0px_#151413]">
        <div className="flex items-center gap-2">
          <span className="font-pixel-display text-xs font-bold bg-[#151413] text-[#F8F6F0] px-2 py-0.5">
            DYNAMIC CORPUS
          </span>
          <span className="text-xs text-[#575249]">
            Ingest custom documentation, APIs, and SDK code into hybrid vector &amp; BM25 memory
          </span>
        </div>
        <div className="text-[11px] font-bold text-[#151413]">
          ACTIVE CHUNKS: <span className="text-[#059669]">{docs.length}</span>
        </div>
      </div>

      <div className="pixel-card p-5 space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#151413]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#059669]" />
            <span className="text-xs font-bold text-[#151413]">
              INDEXED KNOWLEDGE BASE ({docs.length} DOCUMENTS)
            </span>
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="pixel-btn text-xs py-1 px-3 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? "animate-spin" : ""}`} />
            <span>RESET CORPUS</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] font-bold text-[#8A8376] uppercase tracking-wider mr-1">
            QUICK PRESETS:
          </span>
          {PRESET_DOCS.map((p) => (
            <button
              key={p.category}
              onClick={() => loadPreset(p)}
              className="text-[11px] font-semibold px-2.5 py-1 bg-[#EFECE3] border border-[#151413] shadow-[1.5px_1.5px_0px_#151413] hover:bg-white text-[#151413] transition-all"
            >
              [{p.category}]
            </button>
          ))}
        </div>

        {/* Ingestion Form */}
        <form onSubmit={handleAdd} className="space-y-3 p-3.5 bg-[#EFECE3] border border-[#151413] shadow-[2px_2px_0px_#151413]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title (e.g. Stripe Webhook Verification)"
                className="pixel-input w-full px-3 py-2 text-xs text-[#151413]"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (e.g. Payments API)"
                className="pixel-input w-full px-3 py-2 text-xs text-[#151413]"
              />
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste raw documentation text, code examples, or internal architecture specs..."
            rows={4}
            className="pixel-input w-full px-3 py-2 text-xs text-[#151413] leading-relaxed"
            required
          />

          <div className="flex items-center justify-between pt-1">
            {successMsg ? (
              <span className="text-xs text-[#059669] font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </span>
            ) : (
              <span className="text-[11px] text-[#575249]">
                All 3 RAG variants immediately query across this newly ingested context.
              </span>
            )}

            <button
              type="submit"
              disabled={isAdding}
              className="pixel-btn pixel-btn-emerald py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? "INDEXING..." : "INGEST DOCUMENT"}</span>
            </button>
          </div>
        </form>

        {/* Active Indexed Documents Grid */}
        <div className="space-y-2.5 pt-1">
          <span className="text-xs font-bold text-[#151413]">ACTIVE INGESTED CHUNKS</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {docs.map((d) => (
              <div key={d.id} className="p-3 bg-white border border-[#151413] shadow-[1.5px_1.5px_0px_#151413] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#151413] truncate">{d.title}</span>
                  <span className="pixel-badge text-[9px]">{d.category}</span>
                </div>
                <p className="text-[#575249] text-[11px] leading-snug line-clamp-2">
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
