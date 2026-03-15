import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { extractDeckText } from "@/lib/extract-deck-text";
import { scoreDeck } from "@/lib/piq-score";
import { SlideData } from "@/lib/types";
import { nanoid } from "nanoid";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyNameOverride = formData.get("companyName") as string | null;
    const saveDeck = formData.get("saveDeck") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
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

    // Extract text
    const extraction = await extractDeckText(buffer, fileType);

    if (extraction.fullText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this file. It may be image-based. Please upload a text-based PDF or PPTX file.",
        },
        { status: 422 }
      );
    }

    const companyName = companyNameOverride?.trim() || extraction.detectedCompanyName;

    // Convert extracted slides to SlideData format for scoring
    const slides: SlideData[] = extraction.slides.map((s) => {
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

    // Build minimal input for scoring
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

    // Score the deck
    const piqScore = await scoreDeck(slides, scoringInput);

    // Optionally persist as a deck
    let deckId: string | undefined;
    let shareId: string | undefined;

    if (saveDeck) {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as { id?: string })?.id;

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
          userId: userId || null,
        },
      });
      deckId = deck.id;
    }

    return NextResponse.json({
      piqScore,
      slideCount: extraction.slideCount,
      companyName,
      deckId,
      shareId,
    });
  } catch (err) {
    console.error("Score upload error:", err);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
