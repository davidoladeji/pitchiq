/**
 * Social media image export utility for PitchIQ pitch deck editor.
 * Renders selected slides as platform-optimised images (PNG),
 * bundled into a ZIP when exporting multiple slides.
 */

export type SocialPlatform = "linkedin" | "twitter" | "instagram";

export interface SocialExportOpts {
  platform: SocialPlatform;
  slideIndices: number[];
  deckTitle: string;
}

const PLATFORM_DIMS: Record<
  SocialPlatform,
  { width: number; height: number; label: string }
> = {
  linkedin: { width: 1080, height: 1080, label: "LinkedIn Carousel" },
  twitter: { width: 1600, height: 900, label: "Twitter/X" },
  instagram: { width: 1080, height: 1350, label: "Instagram" },
};

/** Exposed for UI consumption (e.g. platform picker dropdowns). */
export const PLATFORMS = PLATFORM_DIMS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSlideContainer(): HTMLElement | null {
  return (
    document.getElementById("editor-slide-container") ??
    document.getElementById("pdf-slides-container")
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "pitch-deck";
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up
  requestAnimationFrame(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  });
}

/**
 * Draw `source` canvas onto a new canvas at the target dimensions,
 * centred and scaled-to-cover (maintaining aspect ratio, cropping edges).
 */
function resizeCanvasToCover(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = targetW;
  out.height = targetH;

  const ctx = out.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create 2D canvas context.");
  }

  const srcRatio = source.width / source.height;
  const tgtRatio = targetW / targetH;

  let drawW: number;
  let drawH: number;

  if (srcRatio > tgtRatio) {
    // Source is wider — fit height, crop sides
    drawH = targetH;
    drawW = targetH * srcRatio;
  } else {
    // Source is taller — fit width, crop top/bottom
    drawW = targetW;
    drawH = targetW / srcRatio;
  }

  const offsetX = (targetW - drawW) / 2;
  const offsetY = (targetH - drawH) / 2;

  // Fill with white in case of rounding gaps
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);

  ctx.drawImage(source, offsetX, offsetY, drawW, drawH);

  return out;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob returned null."));
        }
      },
      "image/png"
    );
  });
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function exportSocialImages(
  opts: SocialExportOpts
): Promise<void> {
  const { platform, slideIndices, deckTitle } = opts;

  const { default: html2canvas } = await import("html2canvas");

  const dims = PLATFORM_DIMS[platform];
  const container = getSlideContainer();

  if (!container) {
    throw new Error(
      "No slide container found. Open the editor or viewer before exporting."
    );
  }

  const slides = Array.from(container.children) as HTMLElement[];
  const safeName = sanitizeFilename(deckTitle);

  const rendered: { blob: Blob; filename: string }[] = [];

  for (const idx of slideIndices) {
    const slide = slides[idx];
    if (!slide) {
      continue;
    }

    try {
      const captured = await html2canvas(slide, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const resized = resizeCanvasToCover(captured, dims.width, dims.height);
      const blob = await canvasToBlob(resized);

      rendered.push({
        blob,
        filename: `${safeName}-${platform}-slide-${idx + 1}.png`,
      });
    } catch {
      // Skip slides that fail to render
    }
  }

  if (rendered.length === 0) {
    throw new Error("No slides could be rendered for export.");
  }

  if (rendered.length === 1) {
    downloadBlob(rendered[0].blob, rendered[0].filename);
    return;
  }

  // Multiple slides — bundle into a ZIP
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  for (const item of rendered) {
    zip.file(item.filename, item.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `${safeName}-${platform}-slides.zip`);
}
