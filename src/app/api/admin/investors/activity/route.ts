import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/investors/activity
 * Bulk update investor activity data (lastActiveDate, avgResponseDays, etc.)
 * Body: { updates: [{ id, lastActiveDate?, avgResponseDays?, avgCloseWeeks?, deploymentPace? }] }
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updates = body.updates as Array<{
    id: string;
    lastActiveDate?: string;
    avgResponseDays?: number;
    avgCloseWeeks?: number;
    deploymentPace?: string;
  }>;

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: "Expected { updates: [...] }" }, { status: 400 });
  }

  let updated = 0;
  let errors = 0;

  for (const u of updates) {
    if (!u.id) { errors++; continue; }

    try {
      const data: Record<string, unknown> = {};
      if (u.lastActiveDate) data.lastActiveDate = new Date(u.lastActiveDate);
      if (u.avgResponseDays !== undefined) data.avgResponseDays = u.avgResponseDays;
      if (u.avgCloseWeeks !== undefined) data.avgCloseWeeks = u.avgCloseWeeks;
      if (u.deploymentPace) data.deploymentPace = u.deploymentPace;

      if (Object.keys(data).length > 0) {
        await prisma.investorProfile.update({
          where: { id: u.id },
          data,
        });
        updated++;
      }
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ updated, errors });
}
