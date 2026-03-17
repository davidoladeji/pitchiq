import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";

/**
 * GET /api/settings — return current user preferences
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        plan: true,
        brandingEnabled: true,
        customLogoUrl: true,
        customCompanyName: true,
        customAccentColor: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[settings] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

/**
 * PATCH /api/settings — update user branding preferences
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const limits = getPlanLimits(user.plan);

    // Build update payload with validation
    const update: Record<string, unknown> = {};

    if (body.brandingEnabled !== undefined) {
      // Only paid users (where plan doesn't force branding) can disable branding
      if (!body.brandingEnabled && limits.showBranding) {
        return NextResponse.json(
          { error: "Upgrade to Pro to remove PitchIQ branding" },
          { status: 403 }
        );
      }
      update.brandingEnabled = !!body.brandingEnabled;
    }

    if (body.customLogoUrl !== undefined) {
      if (limits.showBranding) {
        return NextResponse.json(
          { error: "Upgrade to Pro to customize branding" },
          { status: 403 }
        );
      }
      update.customLogoUrl = body.customLogoUrl
        ? String(body.customLogoUrl).slice(0, 500)
        : null;
    }

    if (body.customCompanyName !== undefined) {
      if (limits.showBranding) {
        return NextResponse.json(
          { error: "Upgrade to Pro to customize branding" },
          { status: 403 }
        );
      }
      update.customCompanyName = body.customCompanyName
        ? String(body.customCompanyName).slice(0, 100)
        : null;
    }

    if (body.customAccentColor !== undefined) {
      if (limits.showBranding) {
        return NextResponse.json(
          { error: "Upgrade to Pro to customize branding" },
          { status: 403 }
        );
      }
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      if (body.customAccentColor && !hexRegex.test(body.customAccentColor)) {
        return NextResponse.json(
          { error: "Invalid color format (use #RRGGBB)" },
          { status: 400 }
        );
      }
      update.customAccentColor = body.customAccentColor || null;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: update,
      select: {
        name: true,
        email: true,
        image: true,
        plan: true,
        brandingEnabled: true,
        customLogoUrl: true,
        customCompanyName: true,
        customAccentColor: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[settings] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
