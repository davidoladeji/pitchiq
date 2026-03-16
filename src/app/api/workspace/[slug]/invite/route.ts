import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getWorkspaceAndMember, canAdmin } from "@/lib/workspace-helpers";
import { sendEmail } from "@/lib/email";
import { workspaceInvite } from "@/lib/email-templates";
import { nanoid } from "nanoid";

/**
 * POST /api/workspace/[slug]/invite — Send an invite to join the workspace.
 */
export async function POST(
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
      return NextResponse.json({ error: "Only workspace owner can invite members" }, { status: 403 });
    }

    const { email, role = "editor" } = (await req.json()) as { email: string; role?: string };

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (!["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Role must be 'editor' or 'viewer'" }, { status: 400 });
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: result.workspace.id,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json({ error: "User is already a member" }, { status: 409 });
      }
    }

    // Check for existing pending invite
    const existingInvite = await prisma.workspaceInvite.findFirst({
      where: {
        workspaceId: result.workspace.id,
        email: email.trim().toLowerCase(),
        accepted: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json({ error: "An invite is already pending for this email" }, { status: 409 });
    }

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: result.workspace.id,
        email: email.trim().toLowerCase(),
        role,
        token,
        expiresAt,
      },
    });

    // Send invite email
    const appUrl = new URL(req.url).origin;
    const joinUrl = `${appUrl}/api/workspace/${params.slug}/join?token=${token}`;

    await sendEmail({
      to: email.trim(),
      subject: `You're invited to join "${result.workspace.name}" on PitchIQ`,
      html: workspaceInvite({
        workspaceName: result.workspace.name,
        inviterName: session?.user?.name || session?.user?.email || "A teammate",
        role,
        joinUrl,
      }),
    });

    return NextResponse.json({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("[workspace-invite] Error:", err);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
