import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/decks/[shareId]/comments/[id] — Resolve or update a comment.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { shareId: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      select: { id: true, userId: true, workspaceId: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const comment = await prisma.slideComment.findFirst({
      where: { id: params.id, deckId: deck.id },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only deck owner or comment author can modify
    const isOwner = deck.userId === userId;
    const isAuthor = comment.userId === userId;

    if (!isOwner && !isAuthor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { resolved, content } = (await req.json()) as {
      resolved?: boolean;
      content?: string;
    };

    const updated = await prisma.slideComment.update({
      where: { id: params.id },
      data: {
        ...(typeof resolved === "boolean" ? { resolved } : {}),
        ...(content?.trim() && isAuthor ? { content: content.trim() } : {}),
      },
    });

    return NextResponse.json({
      id: updated.id,
      resolved: updated.resolved,
      content: updated.content,
    });
  } catch (err) {
    console.error("[comment-update] Error:", err);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}
