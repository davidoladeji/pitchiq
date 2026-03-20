import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await prisma.matchingConfig.findFirst({
    where: { name: "default", active: true },
  });

  if (!config) {
    return NextResponse.json({ weights: null });
  }

  try {
    const weights = JSON.parse(config.weights);
    return NextResponse.json({ weights });
  } catch {
    return NextResponse.json({ weights: null });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { weights } = body;

  if (!weights || typeof weights !== "object") {
    return NextResponse.json({ error: "Invalid weights" }, { status: 400 });
  }

  await prisma.matchingConfig.upsert({
    where: { name: "default" },
    create: {
      name: "default",
      weights: JSON.stringify(weights),
      active: true,
    },
    update: {
      weights: JSON.stringify(weights),
    },
  });

  return NextResponse.json({ success: true });
}
