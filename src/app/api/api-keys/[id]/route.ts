import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { id: params.id },
    select: { userId: true, revoked: true },
  });

  if (!apiKey || apiKey.userId !== userId) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  if (apiKey.revoked) {
    return NextResponse.json({ error: "API key is already revoked" }, { status: 400 });
  }

  await prisma.apiKey.update({
    where: { id: params.id },
    data: { revoked: true },
  });

  return NextResponse.json({ success: true });
}
