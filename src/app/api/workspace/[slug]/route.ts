import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getWorkspaceAndMember, canAdmin } from "@/lib/workspace-helpers";

/**
 * GET /api/workspace/[slug] — Get workspace details.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const result = await getWorkspaceAndMember(params.slug, userId);
    if (!result || !result.isMember) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug: params.slug },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        },
        decks: {
          select: {
            id: true,
            shareId: true,
            title: true,
            companyName: true,
            themeId: true,
            piqScore: true,
            createdAt: true,
            _count: { select: { views: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { invites: { where: { accepted: false } } } },
      },
    });

    return NextResponse.json({
      id: workspace!.id,
      name: workspace!.name,
      slug: workspace!.slug,
      role: result.role,
      isOwner: result.isOwner,
      members: workspace!.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role,
      })),
      decks: workspace!.decks.map((d) => ({
        id: d.id,
        shareId: d.shareId,
        title: d.title,
        companyName: d.companyName,
        themeId: d.themeId,
        piqScore: d.piqScore,
        createdAt: d.createdAt.toISOString(),
        viewCount: d._count.views,
      })),
      pendingInvites: workspace!._count.invites,
    });
  } catch (err) {
    console.error("[workspace] Get error:", err);
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
  }
}

/**
 * PATCH /api/workspace/[slug] — Update workspace (name). Owner only.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const result = await getWorkspaceAndMember(params.slug, userId);
    if (!result || !result.isMember) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (!canAdmin(result.role)) {
      return NextResponse.json({ error: "Only workspace owner can update settings" }, { status: 403 });
    }

    const { name } = (await req.json()) as { name?: string };

    const updated = await prisma.workspace.update({
      where: { slug: params.slug },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
      },
    });

    return NextResponse.json({ name: updated.name, slug: updated.slug });
  } catch (err) {
    console.error("[workspace] Update error:", err);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
  }
}
