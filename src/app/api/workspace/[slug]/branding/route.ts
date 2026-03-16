import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { getWorkspaceAndMember, canAdmin } from "@/lib/workspace-helpers";

export interface BrandConfig {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
  hidePitchiqBranding?: boolean;
}

/**
 * GET /api/workspace/[slug]/branding — get workspace brand config
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const result = await getWorkspaceAndMember(params.slug, userId);
    if (!result) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    let brandConfig: BrandConfig = {};
    try {
      brandConfig = JSON.parse(result.workspace.brandConfig);
    } catch { /* ignore */ }

    return NextResponse.json({ brandConfig });
  } catch (error) {
    console.error("[branding] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch branding" }, { status: 500 });
  }
}

/**
 * PATCH /api/workspace/[slug]/branding — update workspace brand config
 * Enterprise only, owner only
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

    // Check Enterprise plan
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const limits = getPlanLimits(user?.plan ?? "starter");
    if (!limits.teamCollaboration) {
      return NextResponse.json({ error: "Upgrade to Enterprise for white-label branding" }, { status: 403 });
    }

    const result = await getWorkspaceAndMember(params.slug, userId);
    if (!result) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (!canAdmin(result.member.role)) {
      return NextResponse.json({ error: "Only workspace owners can update branding" }, { status: 403 });
    }

    const body = await req.json();
    const { logoUrl, primaryColor, accentColor, companyName, hidePitchiqBranding } = body;

    // Validate colors (basic hex validation)
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    const brandConfig: BrandConfig = {};

    if (logoUrl !== undefined) brandConfig.logoUrl = String(logoUrl).slice(0, 500);
    if (primaryColor !== undefined) {
      if (primaryColor && !hexRegex.test(primaryColor)) {
        return NextResponse.json({ error: "Invalid primary color format (use #RRGGBB)" }, { status: 400 });
      }
      brandConfig.primaryColor = primaryColor || undefined;
    }
    if (accentColor !== undefined) {
      if (accentColor && !hexRegex.test(accentColor)) {
        return NextResponse.json({ error: "Invalid accent color format (use #RRGGBB)" }, { status: 400 });
      }
      brandConfig.accentColor = accentColor || undefined;
    }
    if (companyName !== undefined) brandConfig.companyName = String(companyName).slice(0, 100);
    if (hidePitchiqBranding !== undefined) brandConfig.hidePitchiqBranding = !!hidePitchiqBranding;

    // Merge with existing config
    let existing: BrandConfig = {};
    try {
      existing = JSON.parse(result.workspace.brandConfig);
    } catch { /* ignore */ }

    const merged = { ...existing, ...brandConfig };

    await prisma.workspace.update({
      where: { id: result.workspace.id },
      data: { brandConfig: JSON.stringify(merged) },
    });

    return NextResponse.json({ brandConfig: merged });
  } catch (error) {
    console.error("[branding] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
  }
}
