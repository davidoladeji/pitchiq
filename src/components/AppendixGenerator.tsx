"use client";

import { useState } from "react";

interface AppendixSlide {
  title: string;
  subtitle: string;
  content: string[];
  type: string;
}

const APPENDIX_TYPES = [
  {
    id: "financials",
    label: "Financial Projections",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    id: "market_research",
    label: "Market Research",
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605",
    color: "text-electric",
    bg: "bg-electric/10",
  },
  {
    id: "competitive_matrix",
    label: "Competitive Analysis",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function AppendixGenerator({
  shareId,
  onGenerated,
}: {
  shareId: string;
  onGenerated?: (slides: AppendixSlide[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedSlides, setGeneratedSlides] = useState<AppendixSlide[]>([]);

  function toggleType(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    if (selected.length === 0) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/decks/${shareId}/appendix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ types: selected }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate appendix");
      }

      const data = await res.json();
      setGeneratedSlides(data.slides || []);
      onGenerated?.(data.slides || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-navy mb-1">AI Appendix Generator</h3>
        <p className="text-xs text-navy-500">
          Generate data-rich appendix slides to strengthen your pitch.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {APPENDIX_TYPES.map((type) => {
          const isSelected = selected.includes(type.id);
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleType(type.id)}
              disabled={generating}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? `${type.bg} ${type.color} ring-2 ring-current`
                  : "bg-navy-50 text-navy-400 hover:text-navy"
              } disabled:opacity-50`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={type.icon} />
              </svg>
              {type.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating || selected.length === 0}
        className="px-5 py-2.5 rounded-xl bg-electric text-white text-xs font-semibold disabled:opacity-50 hover:bg-electric-light transition-colors"
      >
        {generating
          ? "Generating..."
          : `Generate ${selected.length} appendix slide${selected.length !== 1 ? "s" : ""}`}
      </button>

      {/* Preview generated slides */}
      {generatedSlides.length > 0 && (
        <div className="space-y-3 mt-4">
          <p className="text-xs font-semibold text-navy">
            Generated {generatedSlides.length} appendix slide{generatedSlides.length !== 1 ? "s" : ""}:
          </p>
          {generatedSlides.map((slide, i) => (
            <div key={i} className="rounded-xl border border-navy-100 bg-navy-50/30 p-4">
              <h4 className="text-sm font-bold text-navy mb-1">{slide.title}</h4>
              {slide.subtitle && (
                <p className="text-xs text-navy-500 mb-2">{slide.subtitle}</p>
              )}
              <ul className="space-y-1">
                {slide.content.map((item, j) => (
                  <li key={j} className="text-xs text-navy-600 flex gap-1.5">
                    <span className="text-electric shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
