import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { isExtendConfigured, uploadToExtend } from "@/lib/extend";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * POST /api/upload
 * Upload a file to Extend.ai and return the file ID.
 * This proxy endpoint keeps the API key server-side.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in required" },
        { status: 401 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`upload:${ip}`, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    if (!isExtendConfigured()) {
      return NextResponse.json(
        { error: "Document processing service not configured", useLocalUpload: true },
        { status: 501 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    if (
      !fileName.endsWith(".pdf") &&
      !fileName.endsWith(".pptx") &&
      !fileName.endsWith(".docx")
    ) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, PPTX, or DOCX." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileId } = await uploadToExtend(buffer, file.name, file.type);

    return NextResponse.json({ fileId, fileName: file.name });
  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Check if Extend.ai is configured (client uses this to decide upload strategy).
 */
export async function GET() {
  return NextResponse.json({
    extendEnabled: isExtendConfigured(),
  });
}
