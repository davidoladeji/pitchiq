"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useEditorStore } from "./state/editorStore";
import { computeDesignScore } from "@/lib/editor/design-rules";
import type { DesignScore, DesignRule } from "@/lib/editor/design-rules";

/** Color for score ranges */
function scoreColor(score: number): string {
  if (score >= 80) return "#06D6A0"; // emerald
  if (score >= 60) return "#FFD166"; // amber
  if (score >= 40) return "#FF9F1C"; // orange
  return "#EF476F"; // red
}

/** Circular progress ring */
function ScoreRing({ score, size = 32 }: { score: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <svg width={size} height={size} className="shrink-0">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={3}
      />
      {/* Score ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-500"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={size * 0.3}
        fontWeight={700}
        fontFamily="monospace"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

function RuleRow({ rule }: { rule: DesignRule }) {
  const color = scoreColor(rule.score);
  const barWidth = `${rule.score}%`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/70 font-medium">{rule.label}</span>
        <span className="text-[11px] font-mono font-semibold" style={{ color }}>
          {Math.round(rule.score)}
        </span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: barWidth, backgroundColor: color }}
        />
      </div>
      {rule.message && rule.score < 80 && (
        <p className="text-[10px] text-white/40 leading-tight">{rule.message}</p>
      )}
    </div>
  );
}

export default function DesignScoreWidget() {
  const slideBlocks = useEditorStore((s) => s.slideBlocks);
  const slideBlockOrder = useEditorStore((s) => s.slideBlockOrder);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const slideId = currentSlideId();

  const designScore: DesignScore = useMemo(() => {
    if (!slideId) return { overall: 0, rules: [] };
    const blocks = slideBlockOrder[slideId] || [];
    const blockMap = slideBlocks[slideId] || {};
    const orderedBlocks = blocks
      .map((id) => blockMap[id])
      .filter(Boolean);
    if (orderedBlocks.length === 0) return { overall: 50, rules: [] };
    return computeDesignScore(orderedBlocks);
  }, [slideId, slideBlocks, slideBlockOrder]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const color = scoreColor(designScore.overall);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        title="Design Score"
      >
        <ScoreRing score={designScore.overall} size={24} />
        <span className="text-[11px] font-semibold hidden sm:inline" style={{ color }}>
          Design
        </span>
      </button>

      {open && designScore.rules.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[#1A1A24] border border-white/10 rounded-xl shadow-2xl z-50 p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <ScoreRing score={designScore.overall} size={40} />
            <div>
              <p className="text-xs font-bold text-white">Design Score</p>
              <p className="text-[10px] text-white/40">
                {designScore.overall >= 80
                  ? "Excellent layout"
                  : designScore.overall >= 60
                  ? "Good, minor improvements"
                  : designScore.overall >= 40
                  ? "Needs attention"
                  : "Significant issues"}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-white/10" />

          {/* Rules */}
          <div className="space-y-2.5">
            {designScore.rules.map((rule) => (
              <RuleRow key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
