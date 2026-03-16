import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import {
  isValidDomain,
  generateVerificationToken,
} from "@/lib/custom-domain";

/**
 * GET /api/custom-domain
 * List all custom domains for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const domains = await prisma.customDomain.findMany({
      where: { userId },
      select: {
        id: true,
        domain: true,
        status: true,
        verificationToken: true,
        verifiedAt: true,
        sslStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ domains });
  } catch (error) {
    console.error("GET /api/custom-domain error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/custom-domain
 * Add a new custom domain. Body: { domain: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    // Check plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const limits = getPlanLimits(user?.plan || "starter");
    if (!limits.customDomain) {
      return NextResponse.json(
        { error: "Upgrade to Growth to use custom domains" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as { domain?: string };
    const domain = body.domain?.trim().toLowerCase();

    if (!domain || !isValidDomain(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format. Provide a bare domain like decks.yourcompany.com" },
        { status: 400 }
      );
    }

    // Check if domain is already registered
    const existing = await prisma.customDomain.findUnique({
      where: { domain },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This domain is already registered" },
        { status: 409 }
      );
    }

    const verificationToken = generateVerificationToken();

    const record = await prisma.customDomain.create({
      data: {
        userId,
        domain,
        verificationToken,
        status: "pending",
        sslStatus: "pending",
      },
      select: {
        id: true,
        domain: true,
        status: true,
        verificationToken: true,
        verifiedAt: true,
        sslStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      domain: record,
      dns: {
        type: "TXT",
        name: `_pitchiq-verify.${record.domain}`,
        value: record.verificationToken,
        instructions: `Add a TXT record for _pitchiq-verify.${record.domain} with value ${record.verificationToken}`,
      },
    });
  } catch (error) {
    console.error("POST /api/custom-domain error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
