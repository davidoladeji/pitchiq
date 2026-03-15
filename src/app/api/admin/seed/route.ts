/**
 * One-time seed: create first admin user. Disable or protect in production.
 * POST body: { email, password }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  if (process.env.ALLOW_ADMIN_SEED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email and password (min 8 chars) required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        role: Role.admin,
      },
    });

    return NextResponse.json({ ok: true, message: "Admin user created" });
  } catch (e) {
    console.error("Admin seed error:", e);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
