/**
 * Extract text content from uploaded deck files (PDF or PPTX).
 * Used for scoring uploaded decks via the PIQ system.
 */

export interface ExtractedSlide {
  slideNumber: number;
  text: string;
}

export interface ExtractionResult {
  slides: ExtractedSlide[];
  fullText: string;
  slideCount: number;
  detectedCompanyName: string;
}

/**
 * Extract text from a PDF buffer using pdf-parse v2.
 */
async function extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  const { PDFParse } = await import("pdf-parse");

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const textResult = await parser.getText();

  const slides: ExtractedSlide[] = textResult.pages.map(
    (page: { num: number; text: string }) => ({
      slideNumber: page.num,
      text: page.text.trim(),
    })
  );

  await parser.destroy();

  const fullText = slides.map((s) => s.text).join("\n\n");

  // Heuristic: company name is usually the first substantial text on slide 1
  const firstSlideLines = (slides[0]?.text || "")
    .split("\n")
    .filter((l: string) => l.trim().length > 1);
  const detectedCompanyName =
    firstSlideLines[0]?.trim().slice(0, 60) || "Unknown Company";

  return {
    slides,
    fullText,
    slideCount: slides.length,
    detectedCompanyName,
  };
}

/**
 * Extract text from a PPTX buffer.
 * PPTX is a ZIP containing XML slide files.
 */
async function extractFromPptx(buffer: Buffer): Promise<ExtractionResult> {
  const AdmZip = (await import("adm-zip")).default;
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  // Find slide XML files: ppt/slides/slide1.xml, slide2.xml, etc.
  const slideEntries = entries
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)/)?.[1] || "0");
      const numB = parseInt(b.entryName.match(/slide(\d+)/)?.[1] || "0");
      return numA - numB;
    });

  const slides: ExtractedSlide[] = slideEntries.map((entry, i) => {
    const xml = entry.getData().toString("utf8");
    // Extract text from <a:t> elements
    const textParts: string[] = [];
    const regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const text = match[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();
      if (text) textParts.push(text);
    }

    return { slideNumber: i + 1, text: textParts.join("\n") };
  });

  const fullText = slides.map((s) => s.text).join("\n\n");

  // Detect company name from first slide
  const firstLines = (slides[0]?.text || "")
    .split("\n")
    .filter((l: string) => l.trim().length > 1);
  const detectedCompanyName =
    firstLines[0]?.trim().slice(0, 60) || "Unknown Company";

  return {
    slides,
    fullText,
    slideCount: slides.length,
    detectedCompanyName,
  };
}

/**
 * Main extraction function — routes to PDF or PPTX handler.
 */
export async function extractDeckText(
  buffer: Buffer,
  fileType: "pdf" | "pptx"
): Promise<ExtractionResult> {
  if (fileType === "pdf") {
    return extractFromPdf(buffer);
  }
  return extractFromPptx(buffer);
}
