import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, requireScope } from "@/lib/api-auth";
import { extractDeckText } from "@/lib/extract-deck-text";
import { scoreDeck, scoreDeckWithVision } from "@/lib/piq-score";
import { SlideData } from "@/lib/types";
import { nanoid } from "nanoid";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateApiKey(req);
    requireScope(auth.scopes, "score");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyNameOverride = formData.get("companyName") as string | null;
    const saveDeck = formData.get("saveDeck") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded. Send a PDF or PPTX as 'file' in FormData." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 100MB." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let fileType: "pdf" | "pptx";
    if (fileName.endsWith(".pdf")) {
      fileType = "pdf";
    } else if (fileName.endsWith(".pptx")) {
      fileType = "pptx";
    } else {
      return NextResponse.json({ error: "Unsupported file type. Upload PDF or PPTX." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text
    let extraction = null;
    try {
      extraction = await extractDeckText(buffer, fileType);
    } catch (extractErr) {
      console.error("[v1/score] Text extraction failed:", extractErr);
      if (fileType === "pptx") {
        return NextResponse.json({ error: "Could not read this PPTX file." }, { status: 422 });
      }
    }

    const companyName =
      companyNameOverride?.trim() ||
      extraction?.detectedCompanyName ||
      "Unknown Company";

    let piqScore = null;

    // Vision scoring for PDFs
    if (fileType === "pdf" && process.env.ANTHROPIC_API_KEY) {
      try {
        piqScore = await scoreDeckWithVision(buffer, companyName);
      } catch (visionErr) {
        console.error("[v1/score] Vision scoring failed:", visionErr instanceof Error ? visionErr.message : visionErr);
      }
    }

    // Build slides from extraction
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
          { error: "Could not extract enough text from this file. Try a PDF with selectable text." },
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
        console.error("[v1/score] AI scoring failed:", scoreErr);
        return NextResponse.json({ error: "AI scoring failed. Please try again." }, { status: 502 });
      }
    }

    // Optionally save as a deck
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
          source: "api",
          originalFileName: file.name,
          userId: auth.user.id,
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
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[v1/score POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
