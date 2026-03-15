import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { extractDeckText, ExtractionResult } from "@/lib/extract-deck-text";
import { scoreDeck, scoreDeckWithVision } from "@/lib/piq-score";
import { SlideData } from "@/lib/types";
import { nanoid } from "nanoid";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in to score your deck", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`score:${ip}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyNameOverride = formData.get("companyName") as string | null;
    const saveDeck = formData.get("saveDeck") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 100MB." }, { status: 400 });
    }

    // Determine file type
    const fileName = file.name.toLowerCase();
    let fileType: "pdf" | "pptx";
    if (fileName.endsWith(".pdf")) {
      fileType = "pdf";
    } else if (fileName.endsWith(".pptx")) {
      fileType = "pptx";
    } else {
      return NextResponse.json({ error: "Unsupported file type. Please upload PDF or PPTX." }, { status: 400 });
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text — this can fail for image-heavy PDFs, which is fine since vision handles those
    let extraction: ExtractionResult | null = null;
    try {
      extraction = await extractDeckText(buffer, fileType);
    } catch (extractErr) {
      console.error("[score] Text extraction failed:", extractErr);
      // For PPTX, text extraction is required (no vision fallback)
      if (fileType === "pptx") {
        return NextResponse.json(
          { error: "Could not read this PPTX file. It may be corrupted." },
          { status: 422 }
        );
      }
    }

    const companyName = companyNameOverride?.trim() || extraction?.detectedCompanyName || "Unknown Company";

    let piqScore = null;

    // === VISION SCORING for PDFs ===
    if (fileType === "pdf" && process.env.ANTHROPIC_API_KEY) {
      try {
        console.log(`[score] Attempting vision scoring for PDF (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
        piqScore = await scoreDeckWithVision(buffer, companyName);
        console.log("[score] Vision scoring succeeded");
      } catch (visionErr) {
        console.error("[score] Vision scoring failed:", visionErr instanceof Error ? visionErr.message : visionErr);
        // Fall through to text-based scoring
      }
    }

    // Convert extracted slides to SlideData (for text fallback, persistence, and slide count)
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

    // Text-based scoring fallback (for PPTX, or if vision failed for PDF)
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

      piqScore = await scoreDeck(slides, scoringInput);
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
  } catch (err) {
    console.error("[score] Unhandled error:", err instanceof Error ? err.stack : err);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
