import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { extractDeckText } from "@/lib/extract-deck-text";
import { scoreDeck, scoreDeckWithVision } from "@/lib/piq-score";
import { SlideData } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

interface BatchResultItem {
  fileName: string;
  score: number;
  grade: string;
  dimensions: { id: string; label: string; score: number }[];
  error?: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.batchJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    jobs: jobs.map((j) => ({
      ...j,
      results: JSON.parse(j.results),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan limits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const plan = user?.plan || "starter";
  const limits = getPlanLimits(plan);

  if (!limits.batchScoring) {
    return NextResponse.json(
      { error: "Batch scoring requires an Enterprise plan." },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const name = (formData.get("name") as string) || "Untitled Batch";

  // Collect all files from the form data
  const files: File[] = formData.getAll("files").filter(
    (v): v is File => v instanceof File
  );

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 });
  }

  if (files.length > limits.maxBatchSize) {
    return NextResponse.json(
      {
        error: `Too many files. Your plan allows up to ${limits.maxBatchSize} files per batch.`,
      },
      { status: 400 }
    );
  }

  // Validate file types
  const allowedExtensions = [".pdf", ".pptx"];
  for (const file of files) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.name}. Only PDF and PPTX files are accepted.` },
        { status: 400 }
      );
    }
  }

  // Create the batch job
  const job = await prisma.batchJob.create({
    data: {
      userId,
      name,
      status: "processing",
      totalDecks: files.length,
      completed: 0,
      failed: 0,
      results: "[]",
    },
  });

  // Process files sequentially
  const results: BatchResultItem[] = [];
  let completed = 0;
  let failed = 0;
  const startTime = Date.now();
  const MAX_SAFE_DURATION_MS = 270_000; // 270s — leave 30s buffer before 300s limit

  for (const file of files) {
    // Check if we're approaching the timeout
    if (Date.now() - startTime > MAX_SAFE_DURATION_MS) {
      // Save partial results and mark remaining as timed out
      for (let i = results.length; i < files.length; i++) {
        results.push({
          fileName: files[i].name,
          score: 0,
          grade: "N/A",
          dimensions: [],
          error: "Timed out — batch took too long. Try with fewer files.",
        });
        failed++;
      }
      break;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = file.name.split(".").pop()?.toLowerCase() as "pdf" | "pptx";
      const isPdf = ext === "pdf";

      let score: number;
      let grade: string;
      let dimensions: { id: string; label: string; score: number }[];

      if (isPdf) {
        // Use vision scoring for PDFs
        const extraction = await extractDeckText(buffer, "pdf");
        const companyName = extraction.detectedCompanyName || file.name;

        try {
          const piqScore = await scoreDeckWithVision(buffer, companyName);
          score = piqScore.overall;
          grade = piqScore.grade;
          dimensions = piqScore.dimensions.map((d) => ({
            id: d.id,
            label: d.label,
            score: d.score,
          }));
        } catch {
          // Fall back to text-based scoring if vision fails
          const slides: SlideData[] = extraction.slides.map((s, i) => ({
            title: s.text.split("\n")[0] || `Slide ${i + 1}`,
            content: s.text.split("\n").slice(1),
            type: i === 0 ? "title" : "content",
          }));

          const piqScore = await scoreDeck(slides, {
            companyName: companyName,
            industry: "",
            stage: "",
            fundingTarget: "",
            problem: "",
            solution: "",
            keyMetrics: "",
            teamInfo: "",
          });
          score = piqScore.overall;
          grade = piqScore.grade;
          dimensions = piqScore.dimensions.map((d) => ({
            id: d.id,
            label: d.label,
            score: d.score,
          }));
        }
      } else {
        // PPTX — use text extraction + scoreDeck
        const extraction = await extractDeckText(buffer, "pptx");
        const companyName = extraction.detectedCompanyName || file.name;

        const slides: SlideData[] = extraction.slides.map((s, i) => ({
          title: s.text.split("\n")[0] || `Slide ${i + 1}`,
          content: s.text.split("\n").slice(1),
          type: i === 0 ? "title" : "content",
        }));

        const piqScore = await scoreDeck(slides, {
          companyName,
          industry: "",
          stage: "",
          fundingTarget: "",
          problem: "",
          solution: "",
          keyMetrics: "",
          teamInfo: "",
        });
        score = piqScore.overall;
        grade = piqScore.grade;
        dimensions = piqScore.dimensions.map((d) => ({
          id: d.id,
          label: d.label,
          score: d.score,
        }));
      }

      results.push({ fileName: file.name, score, grade, dimensions });
      completed++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown scoring error";
      results.push({
        fileName: file.name,
        score: 0,
        grade: "N/A",
        dimensions: [],
        error: message,
      });
      failed++;
    }

    // Update progress in the database after each file
    await prisma.batchJob.update({
      where: { id: job.id },
      data: {
        completed,
        failed,
        results: JSON.stringify(results),
      },
    });
  }

  // Mark job as completed
  await prisma.batchJob.update({
    where: { id: job.id },
    data: {
      status: "completed",
      completed,
      failed,
      results: JSON.stringify(results),
    },
  });

  return NextResponse.json({
    id: job.id,
    status: "completed",
    totalDecks: files.length,
    completed,
    failed,
    results,
  });
}
