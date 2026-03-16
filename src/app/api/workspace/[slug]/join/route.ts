import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/workspace/[slug]/join?token=xxx
 * Accept a workspace invitation. Redirects to workspace page.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!userId) {
      // Redirect to sign in, then back here
      const callbackUrl = encodeURIComponent(req.url);
      return NextResponse.redirect(`${appUrl}/auth/signin?callbackUrl=${callbackUrl}`);
    }

    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_invite`);
    }

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invite) {
      return NextResponse.redirect(`${appUrl}/dashboard?error=invite_not_found`);
    }

    if (invite.workspace.slug !== params.slug) {
      return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_invite`);
    }

    if (invite.accepted) {
      return NextResponse.redirect(`${appUrl}/workspace/${params.slug}`);
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.redirect(`${appUrl}/dashboard?error=invite_expired`);
    }

    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId,
        },
      },
    });

    if (!existing) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId,
          role: invite.role,
        },
      });
    }

    // Mark invite as accepted
    await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { accepted: true },
    });

    return NextResponse.redirect(`${appUrl}/workspace/${params.slug}`);
  } catch (err) {
    console.error("[workspace-join] Error:", err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/dashboard?error=join_failed`);
  }
}
