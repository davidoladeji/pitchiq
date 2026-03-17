"use client";

import { useMemo } from "react";
import { nanoid } from "nanoid";
import { useEditorStore } from "./state/editorStore";
import {
  analyzeNarrativeArc,
  type NarrativeReport,
  type NarrativeSection,
  type NarrativeSectionId,
} from "@/lib/editor/ai/narrative-analyzer";
import type { SlideData } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="7" cy="7" r="7" fill="#06D6A0" fillOpacity={0.15} />
      <path d="M4 7.2L6 9.2L10 5" stroke="#06D6A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path d="M7 1.5L13 12.5H1L7 1.5Z" fill="#FFD166" fillOpacity={0.15} stroke="#FFD166" strokeWidth="1" strokeLinejoin="round" />
      <path d="M7 6V8.5" stroke="#FFD166" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="10.5" r="0.75" fill="#FFD166" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="7" cy="7" r="7" fill="#EF476F" fillOpacity={0.15} />
      <path d="M5 5L9 9M9 5L5 9" stroke="#EF476F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
      <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Status icon helper                                                 */
/* ------------------------------------------------------------------ */

function StatusIcon({ status }: { status: NarrativeSection["status"] }) {
  switch (status) {
    case "complete":
      return <CheckIcon />;
    case "weak":
      return <WarningIcon />;
    case "missing":
      return <XIcon />;
  }
}

/* ------------------------------------------------------------------ */
/*  Section Row                                                        */
/* ------------------------------------------------------------------ */

function SectionRow({
  section,
  onNavigate,
  onAdd,
}: {
  section: NarrativeSection;
  onNavigate: (index: number) => void;
  onAdd: (section: NarrativeSection) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <StatusIcon status={section.status} />

      <span className="text-[12px] text-white/80 font-medium flex-1 truncate">
        {section.label}
      </span>

      {section.slideIndex !== null ? (
        <button
          type="button"
          onClick={() => onNavigate(section.slideIndex as number)}
          className="text-[10px] font-mono font-semibold text-[#4361EE] bg-[#4361EE]/10 px-2 py-0.5 rounded hover:bg-[#4361EE]/20 transition-colors"
        >
          Slide {(section.slideIndex as number) + 1}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onAdd(section)}
          className="flex items-center gap-1 text-[10px] font-semibold text-[#4361EE] bg-[#4361EE]/10 px-2 py-0.5 rounded hover:bg-[#4361EE]/20 transition-colors"
        >
          <PlusIcon />
          Add
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                       */
/* ------------------------------------------------------------------ */

function completenessColor(pct: number): string {
  if (pct >= 80) return "#06D6A0";
  if (pct >= 60) return "#FFD166";
  if (pct >= 40) return "#FF9F1C";
  return "#EF476F";
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function NarrativeArcPanel() {
  const slides = useEditorStore((s) => s.slides);
  const slideBlocks = useEditorStore((s) => s.slideBlocks);
  const slideBlockOrder = useEditorStore((s) => s.slideBlockOrder);
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const selectSlide = useEditorStore((s) => s.selectSlide);
  const addSlide = useEditorStore((s) => s.addSlide);
  const applyLayoutToSlide = useEditorStore((s) => s.applyLayoutToSlide);

  const report: NarrativeReport = useMemo(
    () => analyzeNarrativeArc({ slides, slideBlocks, slideBlockOrder }),
    [slides, slideBlocks, slideBlockOrder],
  );

  const barColor = completenessColor(report.completeness);

  /* Handle navigate to slide */
  const handleNavigate = (index: number) => {
    selectSlide(index);
  };

  /* Handle add missing section */
  const handleAdd = (section: NarrativeSection) => {
    const newSlide: SlideData = {
      id: nanoid(10),
      title: section.label,
      type: section.defaultSlideType,
      content: [],
    };

    const insertAfter = selectedSlideIndex;
    addSlide(insertAfter, newSlide);

    // Apply the default layout to the newly created slide
    if (newSlide.id) {
      applyLayoutToSlide(newSlide.id, section.defaultLayoutId);
    }

    // Navigate to the new slide (it's at insertAfter + 1)
    selectSlide(insertAfter + 1);
  };

  // Collect gap labels for the warning box
  const gapLabels: string[] = report.gaps.map((gapId: NarrativeSectionId) => {
    const sec = report.sections.find((s) => s.id === gapId);
    return sec ? sec.label : gapId;
  });

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#0F0F14] rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-white tracking-tight">
          Narrative Arc
        </h3>
        <span
          className="text-[12px] font-mono font-bold"
          style={{ color: barColor }}
        >
          {report.completeness}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${report.completeness}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* Section list */}
      <div className="flex flex-col divide-y divide-white/5">
        {report.sections.map((section) => (
          <SectionRow
            key={section.id}
            section={section}
            onNavigate={handleNavigate}
            onAdd={handleAdd}
          />
        ))}
      </div>

      {/* Gaps warning */}
      {gapLabels.length > 0 && (
        <div className="flex gap-2 p-3 rounded-lg bg-[#FFD166]/10 border border-[#FFD166]/20">
          <WarningIcon />
          <p className="text-[11px] text-[#FFD166]/90 leading-snug">
            Missing: {gapLabels.join(", ")}. Investors expect a complete story
            arc for maximum impact.
          </p>
        </div>
      )}

      {/* Suggestions */}
      {report.suggestions.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          {report.suggestions.map((suggestion, i) => (
            <p
              key={i}
              className="text-[10px] text-white/40 leading-snug"
            >
              {suggestion}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
