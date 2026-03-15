/**
 * Admin auth: password hashing and session cookie (UPH-53).
 * Keys from env; never expose secrets to client.
 */
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

const SESSION_COOKIE = "pitchiq_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashStr: string): Promise<boolean> {
  return compare(password, hashStr);
}

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

export function signSession(payload: { userId: string; role: Role }): string {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET must be set and at least 32 chars");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cryptoMod = require("crypto");
  const data = JSON.stringify({ ...payload, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const sig = cryptoMod.createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(JSON.stringify({ data, sig })).toString("base64url");
}

export function verifySession(token: string): { userId: string; role: Role } | null {
  try {
    const secret = getSecret();
    if (!secret) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cryptoMod = require("crypto");
    const raw = JSON.parse(Buffer.from(token, "base64url").toString());
    const sig = cryptoMod.createHmac("sha256", secret).update(raw.data).digest("hex");
    if (sig !== raw.sig) return null;
    const payload = JSON.parse(raw.data);
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ userId: string; role: Role } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function sessionCookieValue(session: { userId: string; role: Role }): string {
  return signSession(session);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export async function requireAdmin(): Promise<{ userId: string }> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return { userId: session.userId };
}
