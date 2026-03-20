import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";

/**
 * GET /api/investors — list all investor contacts for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const limits = getPlanLimits(user?.plan ?? "starter");
    if (!limits.fundraiseTracker) {
      return NextResponse.json({ error: "Upgrade to Growth to use the fundraise tracker" }, { status: 403 });
    }

    const contacts = await prisma.investorContact.findMany({
      where: { userId },
      include: {
        outreach: { orderBy: { sentAt: "desc" }, take: 5 },
        _count: { select: { outreach: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("[investors] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

/**
 * POST /api/investors — create a new investor contact
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const limits = getPlanLimits(user?.plan ?? "starter");
    if (!limits.fundraiseTracker) {
      return NextResponse.json({ error: "Upgrade to Growth to use the fundraise tracker" }, { status: 403 });
    }

    const body = await req.json();
    const { name, firm, email, status, notes, investorProfileId, tags } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const validStatuses = ["identified", "contacted", "meeting", "due_diligence", "term_sheet", "committed", "passed"];
    const contactStatus = validStatuses.includes(status) ? status : "identified";

    const contact = await prisma.investorContact.create({
      data: {
        userId,
        name: name.trim(),
        firm: firm?.trim() || null,
        email: email?.trim() || null,
        status: contactStatus,
        notes: notes?.trim() || "",
        investorProfileId: investorProfileId || null,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || "[]"),
      },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("[investors] POST error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
