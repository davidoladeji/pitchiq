/**
 * PDF export utility for PitchIQ pitch deck editor.
 * Renders each slide in the editor canvas as a high-quality PDF page.
 */

interface PdfExportOpts {
  deckTitle: string;
  companyName: string;
  slideCount: number;
  watermark: boolean;
  showBranding: boolean;
}

const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

function getSlideContainer(): HTMLElement | null {
  return (
    document.getElementById("editor-slide-container") ??
    document.getElementById("pdf-slides-container")
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "pitch-deck";
}

export async function exportPdf(opts: PdfExportOpts): Promise<void> {
  const { deckTitle, companyName, watermark, showBranding } = opts;

  const jspdfModule = await import("jspdf");
  const jsPDF = jspdfModule.default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GState = (jspdfModule as any).GState;
  const { default: html2canvas } = await import("html2canvas");

  const container = getSlideContainer();

  if (!container) {
    // Fallback: text-only PDF when no rendered container is available
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [SLIDE_WIDTH, SLIDE_HEIGHT],
    });

    doc.setFontSize(32);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Export from the viewer page for visual PDF",
      SLIDE_WIDTH / 2,
      SLIDE_HEIGHT / 2,
      { align: "center" }
    );

    doc.save(`${sanitizeFilename(deckTitle)}-pitch-deck.pdf`);
    return;
  }

  const slides = Array.from(container.children) as HTMLElement[];

  if (slides.length === 0) {
    throw new Error("No slides found in the container.");
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [SLIDE_WIDTH, SLIDE_HEIGHT],
  });

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) {
      doc.addPage([SLIDE_WIDTH, SLIDE_HEIGHT], "landscape");
    }

    try {
      const canvas = await html2canvas(slides[i], {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      doc.addImage(imgData, "JPEG", 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);
    } catch {
      // If html2canvas fails for a slide, add a placeholder page
      doc.setFontSize(24);
      doc.setTextColor(180, 180, 180);
      doc.text(
        `Slide ${i + 1} could not be rendered`,
        SLIDE_WIDTH / 2,
        SLIDE_HEIGHT / 2,
        { align: "center" }
      );
    }

    // Watermark
    if (watermark) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = doc as any;
      d.saveGraphicsState();
      const gState = new GState({ opacity: 0.1 });
      d.setGState(gState);
      doc.setFontSize(120);
      doc.setTextColor(0, 0, 0);

      // Rotate text diagonally across the page
      const centerX = SLIDE_WIDTH / 2;
      const centerY = SLIDE_HEIGHT / 2;
      doc.text("PitchIQ Free", centerX, centerY, {
        align: "center",
        angle: 45,
      });
      d.restoreGraphicsState();
    }

    // Branding footer
    if (showBranding) {
      doc.setFontSize(14);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${companyName} | Made with PitchIQ`,
        SLIDE_WIDTH / 2,
        SLIDE_HEIGHT - 20,
        { align: "center" }
      );
    }

    // Page number bottom-right
    doc.setFontSize(12);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `${i + 1} / ${slides.length}`,
      SLIDE_WIDTH - 40,
      SLIDE_HEIGHT - 20,
      { align: "right" }
    );
  }

  doc.save(`${sanitizeFilename(deckTitle)}-pitch-deck.pdf`);
}
