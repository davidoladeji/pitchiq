import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { extractDeckText, ExtractionResult } from "@/lib/extract-deck-text";
import { scoreDeck, scoreDeckWithVision } from "@/lib/piq-score";
import { SlideData } from "@/lib/types";
import { nanoid } from "nanoid";
import { rateLimit } from "@/lib/rate-limit";
import { isExtendConfigured, parseFile } from "@/lib/extend";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to score your deck", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`score:${ip}`, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // === PATH A: Extend.ai file ID (JSON body) ===
    if (contentType.includes("application/json")) {
      return handleExtendScore(req, userId);
    }

    // === PATH B: Direct file upload (FormData — local fallback) ===
    return handleLocalScore(req, userId);
  } catch (err) {
    console.error("[score] Unhandled error:", err instanceof Error ? err.stack : err);

    // Categorize the error
    if (err instanceof Error && err.message?.includes("timeout")) {
      return NextResponse.json(
        { error: "Processing timed out. Try a smaller file or PDF format.", code: "TIMEOUT" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process file. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// ─── Path A: Score via Extend.ai parsed file ───────────────────────────────

async function handleExtendScore(req: NextRequest, userId: string) {
  const { fileId, companyName: companyNameOverride, saveDeck } = (await req.json()) as {
    fileId: string;
    companyName?: string;
    saveDeck?: boolean;
  };

  if (!fileId) {
    return NextResponse.json({ error: "fileId required" }, { status: 400 });
  }

  if (!isExtendConfigured()) {
    return NextResponse.json(
      { error: "Document processing service not configured" },
      { status: 501 }
    );
  }

  // Parse the file via Extend
  let parsed;
  try {
    parsed = await parseFile(fileId);
  } catch (parseErr) {
    console.error("[score] Extend parse failed:", parseErr);
    return NextResponse.json(
      { error: "Failed to parse document. The file may be corrupted or unsupported.", code: "PARSE_FAILED" },
      { status: 422 }
    );
  }

  if (!parsed.fullText || parsed.fullText.trim().length < 50) {
    return NextResponse.json(
      {
        error:
          "Could not extract enough text from this file. For best results with image-heavy decks, please upload as PDF.",
        code: "INSUFFICIENT_TEXT",
      },
      { status: 422 }
    );
  }

  // Convert parsed chunks to slides
  const slides: SlideData[] = parsed.chunks.map((chunk, i) => {
    const lines = chunk.content
      .split("\n")
      .filter((l) => l.trim().length > 0);
    const title = lines[0]?.replace(/^#+\s*/, "").slice(0, 100) || `Slide ${i + 1}`;
    const content = lines.slice(1).filter((l) => l.trim().length > 2);

    return {
      title,
      subtitle: "",
      content: content.length > 0 ? content : [chunk.content.slice(0, 200)],
      type: "content" as const,
    };
  });

  // Detect company name from first chunk if not provided
  const companyName =
    companyNameOverride?.trim() ||
    detectCompanyName(parsed.fullText) ||
    "Unknown Company";

  // Score using text-based scorer
  let piqScore;
  try {
    const scoringInput = {
      companyName,
      industry: "",
      stage: "",
      fundingTarget: "",
      problem: "",
      solution: "",
      keyMetrics: "",
      teamInfo: "",
    };
    piqScore = await scoreDeck(slides, scoringInput);
  } catch (scoreErr) {
    console.error("[score] AI scoring failed:", scoreErr);
    return NextResponse.json(
      { error: "AI scoring failed. Please try again.", code: "SCORING_FAILED" },
      { status: 502 }
    );
  }

  // Optionally persist
  let deckId: string | undefined;
  let shareId: string | undefined;

  if (saveDeck) {
    shareId = nanoid(10);
    const deck = await prisma.deck.create({
      data: {
        shareId,
        title: `${companyName} — Uploaded Deck`,
        companyName,
        industry: "",
        stage: "",
        fundingTarget: "",
        investorType: "vc",
        problem: "",
        solution: "",
        keyMetrics: "",
        teamInfo: "",
        slides: JSON.stringify(slides),
        piqScore: JSON.stringify(piqScore),
        themeId: "midnight",
        source: "uploaded",
        userId,
      },
    });
    deckId = deck.id;
  }

  return NextResponse.json({
    piqScore,
    slideCount: parsed.pageCount || slides.length,
    companyName,
    deckId,
    shareId,
  });
}

// ─── Path B: Score via local file upload (FormData) ─────────────────────────

async function handleLocalScore(req: NextRequest, userId: string) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const companyNameOverride = formData.get("companyName") as string | null;
  const saveDeck = formData.get("saveDeck") === "true";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 100MB." },
      { status: 400 }
    );
  }

  // Determine file type
  const fileName = file.name.toLowerCase();
  let fileType: "pdf" | "pptx";
  if (fileName.endsWith(".pdf")) {
    fileType = "pdf";
  } else if (fileName.endsWith(".pptx")) {
    fileType = "pptx";
  } else {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload PDF or PPTX." },
      { status: 400 }
    );
  }

  // Read file into buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Extract text
  let extraction: ExtractionResult | null = null;
  try {
    extraction = await extractDeckText(buffer, fileType);
  } catch (extractErr) {
    console.error("[score] Text extraction failed:", extractErr);
    if (fileType === "pptx") {
      return NextResponse.json(
        { error: "Could not read this PPTX file. It may be corrupted." },
        { status: 422 }
      );
    }
  }

  const companyName =
    companyNameOverride?.trim() ||
    extraction?.detectedCompanyName ||
    "Unknown Company";

  let piqScore = null;

  // === VISION SCORING for PDFs ===
  if (fileType === "pdf" && process.env.ANTHROPIC_API_KEY) {
    try {
      console.log(
        `[score] Attempting vision scoring for PDF (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`
      );
      piqScore = await scoreDeckWithVision(buffer, companyName);
      console.log("[score] Vision scoring succeeded");
    } catch (visionErr) {
      console.error(
        "[score] Vision scoring failed:",
        visionErr instanceof Error ? visionErr.message : visionErr
      );
      // Fall through to text-based scoring
    }
  }

  // Convert extracted slides to SlideData
  let slides: SlideData[] = [];
  let slideCount = 0;

  if (extraction) {
    slideCount = extraction.slideCount;
    slides = extraction.slides.map((s) => {
      const lines = s.text.split("\n").filter((l) => l.trim().length > 0);
      const title = lines[0]?.slice(0, 100) || `Slide ${s.slideNumber}`;
      const content = lines.slice(1).filter((l) => l.trim().length > 2);

      return {
        title,
        subtitle: "",
        content: content.length > 0 ? content : [s.text.slice(0, 200)],
        type: "content" as const,
      };
    });
  }

  // Text-based scoring fallback
  if (!piqScore) {
    if (!extraction || extraction.fullText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this file. For best results with image-heavy decks, please upload as PDF.",
        },
        { status: 422 }
      );
    }

    const scoringInput = {
      companyName,
      industry: "",
      stage: "",
      fundingTarget: "",
      problem: "",
      solution: "",
      keyMetrics: "",
      teamInfo: "",
    };

    try {
      piqScore = await scoreDeck(slides, scoringInput);
    } catch (scoreErr) {
      console.error("[score] AI scoring failed:", scoreErr);
      return NextResponse.json(
        { error: "AI scoring failed. Please try again.", code: "SCORING_FAILED" },
        { status: 502 }
      );
    }
  }

  // Optionally persist as a deck
  let deckId: string | undefined;
  let shareId: string | undefined;

  if (saveDeck) {
    shareId = nanoid(10);
    const deck = await prisma.deck.create({
      data: {
        shareId,
        title: `${companyName} — Uploaded Deck`,
        companyName,
        industry: "",
        stage: "",
        fundingTarget: "",
        investorType: "vc",
        problem: "",
        solution: "",
        keyMetrics: "",
        teamInfo: "",
        slides: JSON.stringify(slides),
        piqScore: JSON.stringify(piqScore),
        themeId: "midnight",
        source: "uploaded",
        originalFileName: file.name,
        userId,
      },
    });
    deckId = deck.id;
  }

  return NextResponse.json({
    piqScore,
    slideCount: slideCount || slides.length,
    companyName,
    deckId,
    shareId,
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Simple company name detection from text (first line that looks like a name).
 */
function detectCompanyName(text: string): string | null {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/^#+\s*/, "").trim();
    // Short title-like lines that aren't generic headings
    if (
      cleaned.length > 2 &&
      cleaned.length < 60 &&
      !cleaned.toLowerCase().startsWith("slide") &&
      !cleaned.toLowerCase().startsWith("page") &&
      !/^\d+$/.test(cleaned)
    ) {
      return cleaned;
    }
  }
  return null;
}
