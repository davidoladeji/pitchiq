import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/decks/[shareId]/comments — Create a slide comment.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { shareId: string } }
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

    // Must be deck owner, or a workspace member
    const isOwner = deck.userId === userId;
    let isWorkspaceMember = false;

    if (deck.workspaceId) {
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: deck.workspaceId,
            userId,
          },
        },
      });
      isWorkspaceMember = !!member;
    }

    if (!isOwner && !isWorkspaceMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { slideIndex, content, blockId, parentId } = (await req.json()) as {
      slideIndex: number;
      content: string;
      blockId?: string;
      parentId?: string;
    };

    if (typeof slideIndex !== "number" || !content?.trim()) {
      return NextResponse.json({ error: "slideIndex and content required" }, { status: 400 });
    }

    const comment = await prisma.slideComment.create({
      data: {
        deckId: deck.id,
        slideIndex,
        content: content.trim(),
        blockId: blockId || null,
        parentId: parentId || null,
        userId,
      },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    });

    return NextResponse.json({
      id: comment.id,
      slideIndex: comment.slideIndex,
      content: comment.content,
      blockId: comment.blockId,
      parentId: comment.parentId,
      resolved: comment.resolved,
      user: {
        name: comment.user.name,
        email: comment.user.email,
        image: comment.user.image,
      },
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[comments] Create error:", err);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

/**
 * GET /api/decks/[shareId]/comments — List comments for a deck.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
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

    // Permission check
    const isOwner = deck.userId === userId;
    let isWorkspaceMember = false;

    if (deck.workspaceId) {
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: deck.workspaceId,
            userId,
          },
        },
      });
      isWorkspaceMember = !!member;
    }

    if (!isOwner && !isWorkspaceMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const comments = await prisma.slideComment.findMany({
      where: { deckId: deck.id, parentId: null }, // Top-level only
      include: {
        user: { select: { name: true, email: true, image: true } },
        replies: {
          include: {
            user: { select: { name: true, email: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        slideIndex: c.slideIndex,
        content: c.content,
        blockId: c.blockId,
        resolved: c.resolved,
        user: {
          name: c.user.name,
          email: c.user.email,
          image: c.user.image,
        },
        replies: c.replies.map((r) => ({
          id: r.id,
          content: r.content,
          user: {
            name: r.user.name,
            email: r.user.email,
            image: r.user.image,
          },
          createdAt: r.createdAt.toISOString(),
        })),
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[comments] List error:", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
