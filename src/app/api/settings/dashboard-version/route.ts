import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dashboardVersion: true },
  });

  return NextResponse.json({ version: user?.dashboardVersion ?? "classic" });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const version = body.version;
  if (version !== "classic" && version !== "new") {
    return NextResponse.json({ error: "Invalid version. Must be 'classic' or 'new'." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { dashboardVersion: version },
  });

  return NextResponse.json({ version });
}
