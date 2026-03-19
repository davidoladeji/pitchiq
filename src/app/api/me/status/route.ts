import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Lightweight endpoint for checking the current user's account status.
 * Used by the SuspendedOverlay component to detect frozen accounts.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ authenticated: false });
  }

  const userId = (session.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { suspended: true, suspendedReason: true },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    suspended: user.suspended,
    suspendedReason: user.suspendedReason,
  });
}
