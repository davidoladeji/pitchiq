import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { generateApiKey } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      scopes: true,
      lastUsedAt: true,
      createdAt: true,
      revoked: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rl = rateLimit(`api-key-create:${userId}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Check plan limits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const limits = getPlanLimits(user?.plan || "starter");

  if (!limits.apiAccess) {
    return NextResponse.json(
      { error: "API access is not available on your current plan. Upgrade to Enterprise." },
      { status: 403 }
    );
  }

  // Check max keys
  const existingCount = await prisma.apiKey.count({
    where: { userId, revoked: false },
  });
  if (existingCount >= limits.maxApiKeys) {
    return NextResponse.json(
      { error: `You can have at most ${limits.maxApiKeys} active API keys. Revoke one first.` },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const name = (body.name as string)?.trim()?.slice(0, 100) || "Default";
  const scopes = Array.isArray(body.scopes)
    ? body.scopes.filter((s: unknown) =>
        typeof s === "string" &&
        ["decks:read", "decks:write", "score", "batch"].includes(s)
      )
    : ["decks:read", "decks:write", "score"];

  const { rawKey, keyHash, keyPrefix } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      keyPrefix,
      scopes: JSON.stringify(scopes),
    },
  });

  // Return the raw key ONCE
  return NextResponse.json({
    id: apiKey.id,
    name: apiKey.name,
    key: rawKey,
    keyPrefix,
    scopes,
    createdAt: apiKey.createdAt.toISOString(),
  });
}
