import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/custom-domain/lookup?hostname=...
 * Internal endpoint used by middleware to check if a hostname is a verified custom domain.
 * Protected by x-middleware-check header to prevent external abuse.
 */
export async function GET(req: NextRequest) {
  // Only allow calls from our own middleware
  if (req.headers.get("x-middleware-check") !== "1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hostname = req.nextUrl.searchParams.get("hostname");
  if (!hostname) {
    return NextResponse.json({ found: false });
  }

  try {
    const domain = await prisma.customDomain.findFirst({
      where: { domain: hostname, status: "active" },
      select: { id: true },
    });

    return NextResponse.json({ found: !!domain });
  } catch {
    return NextResponse.json({ found: false });
  }
}
