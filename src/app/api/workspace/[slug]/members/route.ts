import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getWorkspaceAndMember } from "@/lib/workspace-helpers";

/**
 * GET /api/workspace/[slug]/members — List workspace members.
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

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: result.workspace.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[workspace-members] Error:", err);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
