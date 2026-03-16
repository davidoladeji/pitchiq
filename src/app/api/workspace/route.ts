import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

/**
 * POST /api/workspace — Create a new workspace.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { name } = (await req.json()) as { name: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "Workspace name required" }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const slug = `${baseSlug}-${nanoid(6)}`;

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
    });

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    });
  } catch (err) {
    console.error("[workspace] Create error:", err);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}

/**
 * GET /api/workspace — List workspaces for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    // Workspaces where user is owner OR member
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: { select: { members: true, decks: true } },
            owner: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const workspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role,
      isOwner: m.workspace.ownerId === userId,
      memberCount: m.workspace._count.members,
      deckCount: m.workspace._count.decks,
      ownerName: m.workspace.owner.name || m.workspace.owner.email,
    }));

    return NextResponse.json({ workspaces });
  } catch (err) {
    console.error("[workspace] List error:", err);
    return NextResponse.json({ error: "Failed to list workspaces" }, { status: 500 });
  }
}
