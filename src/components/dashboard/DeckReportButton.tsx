"use client";

import { useState } from "react";

interface ReportData {
  deck: { title: string; companyName: string; shareId: string; createdAt: string };
  summary: {
    totalViews: number;
    uniqueViewers: number;
    avgTimeSpent: number;
    totalTimeSpent: number;
    bounceRate: number;
    highEngagement: number;
    medEngagement: number;
    lowEngagement: number;
  };
  dailyViews: { date: string; count: number }[];
  slideEngagement: { slideIndex: number; title: string; views: number; avgTime: number }[];
  piqScore: { overall: number; categories?: Record<string, number> } | null;
  generatedAt: string;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function DeckReportButton({ shareId }: { shareId: string }) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/decks/${shareId}/report`);
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to generate report");
        return;
      }

      const report: ReportData = await res.json();

      // Dynamic import to keep bundle small
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // === Header ===
      doc.setFillColor(15, 23, 42); // navy
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("PitchIQ Analytics Report", margin, 18);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(report.deck.title, margin, 28);

      doc.setFontSize(8);
      doc.text(`Generated ${new Date(report.generatedAt).toLocaleDateString()}`, margin, 35);

      y = 52;

      // === Summary Cards ===
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Overview", margin, y);
      y += 8;

      const cardWidth = (contentWidth - 6) / 4;
      const cards = [
        { label: "Total Views", value: String(report.summary.totalViews) },
        { label: "Unique Viewers", value: String(report.summary.uniqueViewers) },
        { label: "Avg. Time", value: formatTime(report.summary.avgTimeSpent) },
        { label: "Bounce Rate", value: `${report.summary.bounceRate}%` },
      ];

      cards.forEach((card, i) => {
        const x = margin + i * (cardWidth + 2);
        doc.setFillColor(248, 250, 252); // navy-50
        doc.roundedRect(x, y, cardWidth, 20, 2, 2, "F");

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(card.value, x + cardWidth / 2, y + 10, { align: "center" });

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(card.label, x + cardWidth / 2, y + 16, { align: "center" });
      });

      y += 28;

      // === Engagement Distribution ===
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Engagement Distribution", margin, y);
      y += 8;

      const engagementData = [
        { label: "High (>5 min)", count: report.summary.highEngagement, color: [34, 197, 94] as [number, number, number] },
        { label: "Medium (1-5 min)", count: report.summary.medEngagement, color: [251, 191, 36] as [number, number, number] },
        { label: "Low (<1 min)", count: report.summary.lowEngagement, color: [239, 68, 68] as [number, number, number] },
      ];

      const total = report.summary.totalViews || 1;
      engagementData.forEach((item) => {
        const barWidth = (item.count / total) * (contentWidth - 60);
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.roundedRect(margin + 50, y, Math.max(barWidth, 2), 6, 1, 1, "F");

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(item.label, margin, y + 5);

        doc.setTextColor(15, 23, 42);
        doc.text(String(item.count), margin + 54 + Math.max(barWidth, 2), y + 5);

        y += 10;
      });

      y += 6;

      // === PIQ Score ===
      if (report.piqScore) {
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PIQ Score", margin, y);
        y += 8;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, 40, 25, 2, 2, "F");
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        const score = report.piqScore.overall;
        if (score >= 80) doc.setTextColor(34, 197, 94);
        else if (score >= 60) doc.setTextColor(251, 191, 36);
        else doc.setTextColor(239, 68, 68);
        doc.text(String(score), margin + 20, y + 14, { align: "center" });
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text("Overall", margin + 20, y + 21, { align: "center" });

        if (report.piqScore.categories) {
          let cx = margin + 48;
          Object.entries(report.piqScore.categories).forEach(([key, val]) => {
            if (cx + 35 > pageWidth - margin) return;
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(cx, y, 35, 25, 2, 2, "F");
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(String(val), cx + 17.5, y + 12, { align: "center" });
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            doc.text(label, cx + 17.5, y + 20, { align: "center", maxWidth: 33 });
            cx += 37;
          });
        }

        y += 33;
      }

      // === Slide Engagement Table ===
      if (report.slideEngagement.length > 0) {
        if (y > 230) {
          doc.addPage();
          y = margin;
        }

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Slide-Level Engagement", margin, y);
        y += 8;

        // Table header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 7, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text("Slide", margin + 2, y + 5);
        doc.text("Title", margin + 20, y + 5);
        doc.text("Views", pageWidth - margin - 35, y + 5);
        doc.text("Avg Time", pageWidth - margin - 15, y + 5);
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        report.slideEngagement.forEach((slide) => {
          if (y > 275) {
            doc.addPage();
            y = margin;
          }
          doc.setFontSize(7);
          doc.text(String(slide.slideIndex + 1), margin + 2, y + 5);
          doc.text(slide.title.slice(0, 40), margin + 20, y + 5);
          doc.text(String(slide.views), pageWidth - margin - 35, y + 5);
          doc.text(formatTime(slide.avgTime), pageWidth - margin - 15, y + 5);
          y += 6;
        });
      }

      // === Footer ===
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `PitchIQ - ${report.deck.companyName} - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`${report.deck.companyName}-analytics-report.pdf`);
    } catch (err) {
      console.error("Report generation error:", err);
      alert("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-200 text-xs font-semibold text-navy hover:bg-navy-50 transition-colors disabled:opacity-50"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      {generating ? "Generating..." : "Download Report"}
    </button>
  );
}
