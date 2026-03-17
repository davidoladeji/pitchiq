"use client";

import { useState } from "react";
import Link from "next/link";

interface Variant {
  shareId: string;
  title: string;
  investorType: string;
  piqScore: number | null;
}

const TYPE_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  vc: { label: "VC", icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z", color: "text-emerald-600", bg: "bg-emerald-50" },
  angel: { label: "Angel", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", color: "text-pink-600", bg: "bg-pink-50" },
  accelerator: { label: "Accelerator", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", color: "text-amber-600", bg: "bg-amber-50" },
};

export default function DeckVariants({
  shareId,
  variants: initialVariants = [],
  ownerPlan,
}: {
  shareId: string;
  variants: Variant[];
  ownerPlan?: string;
}) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [generating, setGenerating] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");

  const isGrowth = ownerPlan === "growth" || ownerPlan === "enterprise";
  const existingTypes = variants.map((v) => v.investorType);
  const availableTypes = ["vc", "angel", "accelerator"].filter((t) => !existingTypes.includes(t));

  async function handleGenerate() {
    if (selectedTypes.length === 0) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/decks/${shareId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investorTypes: selectedTypes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate variants");
      }

      // Refetch variants
      const varRes = await fetch(`/api/decks/${shareId}/variants`);
      if (varRes.ok) {
        const data = await varRes.json();
        setVariants(data.variants || []);
      }

      setShowPicker(false);
      setSelectedTypes([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  if (!isGrowth) return null;

  return (
    <div className="space-y-3">
      {/* Existing variants */}
      {variants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const meta = TYPE_META[v.investorType] || TYPE_META.vc;
            return (
              <Link
                key={v.shareId}
                href={`/deck/${v.shareId}`}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${meta.bg} border border-transparent hover:border-current/10 transition-all hover:-translate-y-0.5`}
              >
                <svg className={`w-4 h-4 ${meta.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                </svg>
                <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                {v.piqScore !== null && (
                  <span className="text-[10px] font-bold text-navy-400 bg-white/60 px-1.5 py-0.5 rounded">
                    PIQ {v.piqScore}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Generate button / picker */}
      {availableTypes.length > 0 && (
        <>
          {!showPicker ? (
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="inline-flex items-center gap-1.5 text-xs text-electric font-medium hover:underline"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {variants.length > 0 ? "Generate more variants" : "Generate investor variants"}
            </button>
          ) : (
            <div className="rounded-xl border border-navy-200 bg-white p-4 space-y-3">
              <p className="text-xs font-semibold text-navy">Select investor types:</p>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map((type) => {
                  const meta = TYPE_META[type] || TYPE_META.vc;
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? `${meta.bg} ${meta.color} ring-2 ring-current`
                          : "bg-navy-50 text-navy-400 hover:text-navy"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                      </svg>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || selectedTypes.length === 0}
                  className="px-4 py-2 rounded-lg bg-electric text-white text-xs font-semibold disabled:opacity-50 hover:bg-electric-600 transition-colors"
                >
                  {generating ? "Generating..." : `Generate ${selectedTypes.length} variant${selectedTypes.length !== 1 ? "s" : ""}`}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPicker(false); setSelectedTypes([]); setError(""); }}
                  disabled={generating}
                  className="px-4 py-2 rounded-lg bg-navy-50 text-navy-400 text-xs font-semibold hover:text-navy transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
              {generating && (
                <p className="text-[11px] text-navy-400">
                  Each variant takes ~30-60 seconds to generate...
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
