import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ hasGithub: false });
    }

    const githubAccount = await prisma.account.findFirst({
      where: { userId, provider: "github" },
      select: { id: true },
    });

    return NextResponse.json({ hasGithub: !!githubAccount });
  } catch {
    return NextResponse.json({ hasGithub: false });
  }
}
