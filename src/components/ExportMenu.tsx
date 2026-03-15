"use client";

import { useState, useRef, useEffect } from "react";
import { DeckData } from "@/lib/types";

interface ExportMenuProps {
  deck: DeckData;
  className?: string;
}

async function exportPdf(deck: DeckData) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const container = document.getElementById("pdf-slides-container");
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 720] });

  if (container && container.children.length > 0) {
    for (let i = 0; i < container.children.length; i++) {
      if (i > 0) pdf.addPage([1280, 720], "landscape");

      const el = container.children[i] as HTMLElement;

      try {
        const canvas = await html2canvas(el, {
          width: 1280,
          height: 720,
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: null,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(imgData, "JPEG", 0, 0, 1280, 720);
      } catch {
        // Fallback: text-only for this slide
        renderTextSlide(pdf, deck.slides[i], i, deck.slides.length);
      }
    }
  } else {
    // No rendered container — fall back to text-only
    for (let i = 0; i < deck.slides.length; i++) {
      if (i > 0) pdf.addPage([1280, 720], "landscape");
      renderTextSlide(pdf, deck.slides[i], i, deck.slides.length);
    }
  }

  pdf.save(`${deck.companyName}-pitch-deck.pdf`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderTextSlide(pdf: any, slide: DeckData["slides"][number], idx: number, total: number) {
  const isDark = slide.type === "title" || slide.type === "cta" || slide.accent;
  if (isDark) {
    pdf.setFillColor(26, 26, 46);
    pdf.rect(0, 0, 1280, 720, "F");
    pdf.setTextColor(255, 255, 255);
  } else {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 1280, 720, "F");
    pdf.setTextColor(26, 26, 46);
  }
  pdf.setFontSize(40);
  pdf.setFont("helvetica", "bold");
  pdf.text(slide.title, 80, 120);
  if (slide.subtitle) {
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(isDark ? 180 : 120, isDark ? 200 : 120, isDark ? 255 : 140);
    pdf.text(slide.subtitle, 80, 160);
  }
  pdf.setFontSize(18);
  pdf.setTextColor(isDark ? 220 : 60, isDark ? 230 : 60, isDark ? 255 : 80);
  pdf.setFont("helvetica", "normal");
  let yPos = slide.subtitle ? 220 : 200;
  for (const item of slide.content) {
    const lines = pdf.splitTextToSize(`• ${item}`, 1100);
    pdf.text(lines, 80, yPos);
    yPos += lines.length * 28 + 12;
  }
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 170);
  pdf.text("Made with PitchIQ", 80, 690);
  pdf.text(`${idx + 1} / ${total}`, 1180, 690);
}

export default function ExportMenu({ deck, className = "" }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleExport = async (format: "pdf") => {
    setExporting(format);
    try {
      await exportPdf(deck);
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={exporting !== null}
        aria-label="Export deck"
        aria-expanded={open}
        aria-haspopup="menu"
        className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy text-white font-semibold shadow-sm hover:bg-navy-800 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-70"
      >
        {exporting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Exporting…
          </>
        ) : (
          <>
            Export
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-52 bg-white rounded-xl border border-gray-100 shadow-premium-lg py-1 z-50">
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            aria-label="Download deck as PDF"
            className="w-full min-h-[44px] text-left px-4 py-2.5 text-sm text-navy hover:bg-gray-50 transition-colors flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
          >
            <span className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-xs font-bold">PDF</span>
            Download PDF
          </button>
          <div className="border-t border-gray-100 mt-1 pt-1">
            <div className="px-4 py-2.5 text-sm text-gray-500 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-300 flex items-center justify-center text-xs font-bold">PPT</span>
              PPTX Export
              <span className="ml-auto text-[10px] text-gray-500 font-medium">Soon</span>
            </div>
            <div className="px-4 py-2.5 text-sm text-gray-500 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-gray-50 text-gray-300 flex items-center justify-center text-xs font-bold">G</span>
              Google Slides
              <span className="ml-auto text-[10px] text-gray-500 font-medium">Soon</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
