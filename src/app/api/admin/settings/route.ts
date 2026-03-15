import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { clearStripeCache } from "@/lib/stripe";

const SECRET_KEYS = new Set(["stripe_secret_key"]);

function maskSecret(value: string): string {
  if (!value || value.length < 12) return "••••••••";
  return value.slice(0, 7) + "••••••••" + value.slice(-4);
}

/** GET: list settings; secret keys are masked */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await prisma.setting.findMany({ orderBy: { key: "asc" } });
    const list = rows.map((r) => ({
      key: r.key,
      value: SECRET_KEYS.has(r.key) ? maskSecret(r.value) : r.value,
      masked: SECRET_KEYS.has(r.key),
    }));
    return NextResponse.json(list);
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Set DATABASE_URL and run migrations." },
      { status: 503 }
    );
  }
}

/** POST: update a setting (e.g. stripe_secret_key). Only admin. */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { key, value } = body as { key?: string; value?: string };
  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const allowed = ["stripe_secret_key", "stripe_publishable_key"];
  if (!allowed.includes(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: value.trim() },
      update: { value: value.trim() },
    });
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Set DATABASE_URL and run migrations." },
      { status: 503 }
    );
  }

  if (key === "stripe_secret_key") clearStripeCache();

  return NextResponse.json({ ok: true });
}
