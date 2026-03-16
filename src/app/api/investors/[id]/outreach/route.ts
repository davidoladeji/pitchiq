import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/investors/[id]/outreach — list all outreach for a contact
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const contact = await prisma.investorContact.findUnique({
      where: { id: params.id },
    });

    if (!contact || contact.userId !== userId) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const outreach = await prisma.outreach.findMany({
      where: { contactId: params.id },
      orderBy: { sentAt: "desc" },
    });

    return NextResponse.json({ outreach });
  } catch (error) {
    console.error("[outreach] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch outreach" }, { status: 500 });
  }
}

/**
 * POST /api/investors/[id]/outreach — add an outreach entry
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const contact = await prisma.investorContact.findUnique({
      where: { id: params.id },
    });

    if (!contact || contact.userId !== userId) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, content, sentAt } = body;

    const validTypes = ["email", "meeting", "call", "note"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid outreach type" }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const outreach = await prisma.outreach.create({
      data: {
        contactId: params.id,
        type,
        content: content.trim(),
        sentAt: sentAt ? new Date(sentAt) : new Date(),
      },
    });

    return NextResponse.json({ outreach }, { status: 201 });
  } catch (error) {
    console.error("[outreach] POST error:", error);
    return NextResponse.json({ error: "Failed to create outreach" }, { status: 500 });
  }
}
