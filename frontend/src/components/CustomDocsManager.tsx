"use client";

import React, { useState, useEffect } from "react";
import { Plus, RotateCcw, Check } from "lucide-react";
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
    <div className="pixel-box p-4 space-y-3 font-mono select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#D3CDC1] pb-2.5">
        <div>
          <span className="text-[10px] text-[#7A756D]">KNOWLEDGE BASE // DYNAMIC RAG INDEX</span>
          <div className="text-xs font-bold text-[#151413]">
            INGEST CUSTOM DOCUMENTATION INTO VECTOR &amp; BM25 STORE
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#7A756D]">INDEXED: <strong>{docs.length} DOCS</strong></span>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="pixel-btn py-1 px-2.5 text-[10px] flex items-center gap-1 disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Ingest Buttons */}
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="text-[#7A756D]">PRESETS:</span>
        {PRESET_DOCS.map((p) => (
          <button
            key={p.category}
            onClick={() => loadPreset(p)}
            className="px-2 py-0.5 border border-[#D3CDC1] bg-[#EDEAE1] hover:bg-white text-[#151413]"
          >
            [{p.category}]
          </button>
        ))}
      </div>

      {/* Ingestion Form */}
      <form onSubmit={handleAdd} className="p-3 bg-[#EDEAE1] border border-[#D3CDC1] space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title (e.g. Stripe API Integration)"
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#151413] focus:outline-none"
              required
            />
          </div>
          <div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (e.g. Payments)"
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#151413] focus:outline-none"
            />
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste custom documentation text, API specs, or code snippets..."
          rows={3}
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#151413] focus:outline-none"
          required
        />

        <div className="flex items-center justify-between pt-1">
          {successMsg ? (
            <span className="text-[10px] text-[#059669] font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> {successMsg}
            </span>
          ) : (
            <span className="text-[9px] text-[#7A756D]">
              All 3 RAG variants immediately query across this newly ingested context.
            </span>
          )}

          <button
            type="submit"
            disabled={isAdding}
            className="pixel-btn-emerald py-1 px-3 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-3 h-3" />
            <span>{isAdding ? "INDEXING..." : "INGEST DOCUMENT"}</span>
          </button>
        </div>
      </form>

      {/* Active Indexed Documents List */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-[#7A756D]">ACTIVE INGESTED CHUNKS ({docs.length}):</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {docs.map((d) => (
            <div key={d.id} className="p-2 bg-white border border-[#D3CDC1] text-[10px] space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#151413] truncate">{d.title}</span>
                <span className="ticker-badge text-[9px]">{d.category}</span>
              </div>
              <p className="text-[#7A756D] line-clamp-2">{d.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
