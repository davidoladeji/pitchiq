import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getWorkspaceAndMember, canAdmin } from "@/lib/workspace-helpers";

/**
 * PATCH /api/workspace/[slug]/members/[id] — Update member role.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
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
      return NextResponse.json({ error: "Only workspace owner can update roles" }, { status: 403 });
    }

    const { role } = (await req.json()) as { role: string };
    if (!["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Role must be 'editor' or 'viewer'" }, { status: 400 });
    }

    // Can't change owner's role
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: params.id },
    });

    if (!targetMember || targetMember.workspaceId !== result.workspace.id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetMember.role === "owner") {
      return NextResponse.json({ error: "Cannot change owner's role" }, { status: 403 });
    }

    await prisma.workspaceMember.update({
      where: { id: params.id },
      data: { role },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[workspace-member-update] Error:", err);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

/**
 * DELETE /api/workspace/[slug]/members/[id] — Remove a member.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
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

    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: params.id },
    });

    if (!targetMember || targetMember.workspaceId !== result.workspace.id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Owner can remove anyone except themselves
    // Members can only remove themselves
    if (canAdmin(result.role)) {
      if (targetMember.role === "owner") {
        return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 403 });
      }
    } else if (targetMember.userId !== userId) {
      return NextResponse.json({ error: "You can only remove yourself" }, { status: 403 });
    }

    await prisma.workspaceMember.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[workspace-member-delete] Error:", err);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
