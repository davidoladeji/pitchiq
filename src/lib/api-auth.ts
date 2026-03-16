import { NextRequest } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Generate a new API key with prefix `piq_` + 40 hex chars.
 * Returns the raw key (shown once), its SHA-256 hash, and the display prefix.
 */
export function generateApiKey(): {
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
} {
  const random = randomBytes(20).toString("hex"); // 40 hex chars
  const rawKey = `piq_${random}`;
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, 8); // "piq_xxxx"
  return { rawKey, keyHash, keyPrefix };
}

/**
 * SHA-256 hash of an API key string.
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export interface ApiAuthResult {
  user: { id: string; plan: string };
  scopes: string[];
  keyId: string;
}

/**
 * Authenticate a request using an API key from the Authorization header.
 * Throws an object with { status, message } on failure.
 */
export async function authenticateApiKey(
  req: NextRequest
): Promise<ApiAuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer piq_")) {
    throw { status: 401, message: "Missing or invalid API key. Use Authorization: Bearer piq_..." };
  }

  const rawKey = authHeader.slice(7); // remove "Bearer "
  const keyHash = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: { select: { id: true, plan: true } },
    },
  });

  if (!apiKey) {
    throw { status: 401, message: "Invalid API key" };
  }

  if (apiKey.revoked) {
    throw { status: 401, message: "API key has been revoked" };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw { status: 401, message: "API key has expired" };
  }

  // Check user plan has API access
  const limits = getPlanLimits(apiKey.user.plan);
  if (!limits.apiAccess) {
    throw { status: 403, message: "API access is not available on your current plan" };
  }

  // Rate limit by key
  const rl = rateLimit(`api-key:${apiKey.id}`, {
    maxRequests: limits.apiRateLimit,
    windowMs: 60_000, // per minute
  });
  if (!rl.success) {
    throw { status: 429, message: "Rate limit exceeded. Please slow down." };
  }

  // Update lastUsedAt (fire-and-forget)
  prisma.apiKey
    .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  const scopes: string[] = (() => {
    try {
      return JSON.parse(apiKey.scopes);
    } catch {
      return [];
    }
  })();

  return {
    user: apiKey.user,
    scopes,
    keyId: apiKey.id,
  };
}

/**
 * Check if the authenticated scopes include the required scope.
 */
export function requireScope(scopes: string[], required: string): void {
  if (!scopes.includes(required)) {
    throw {
      status: 403,
      message: `This API key does not have the "${required}" scope`,
    };
  }
}
