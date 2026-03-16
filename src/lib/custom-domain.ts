import dns from "dns/promises";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";

/**
 * Validate that a string looks like a bare domain (no protocol, no paths, valid TLD).
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== "string") return false;
  // Reject protocols
  if (/^https?:\/\//i.test(domain)) return false;
  // Reject paths
  if (domain.includes("/")) return false;
  // Reject whitespace
  if (/\s/.test(domain)) return false;
  // Basic domain regex: at least one label + TLD (min 2 chars)
  const domainRegex =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Generate a verification token for DNS TXT record validation.
 */
export function generateVerificationToken(): string {
  return `pitchiq-verify-${nanoid(24)}`;
}

/**
 * Check DNS TXT records for `_pitchiq-verify.{domain}` containing the expected token.
 */
export async function verifyDomainDns(
  domain: string,
  expectedToken: string
): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(`_pitchiq-verify.${domain}`);
    // records is an array of arrays of strings
    for (const record of records) {
      const joined = record.join("");
      if (joined.includes(expectedToken)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// In-memory cache for domain lookups (avoids DB hit on every middleware request)
// ---------------------------------------------------------------------------
interface CachedDomainOwner {
  userId: string;
  domain: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const domainCache = new Map<string, CachedDomainOwner>();

/**
 * Look up the owner of a custom domain hostname.
 * Returns cached result when available (5-min TTL).
 */
export async function getDomainOwner(
  hostname: string
): Promise<{ userId: string; domain: string } | null> {
  const now = Date.now();

  // Check cache
  const cached = domainCache.get(hostname);
  if (cached) {
    if (cached.expiresAt > now) {
      return { userId: cached.userId, domain: cached.domain };
    }
    domainCache.delete(hostname);
  }

  // Query DB
  const record = await prisma.customDomain.findFirst({
    where: { domain: hostname, status: "active" },
    select: { userId: true, domain: true },
  });

  if (!record) return null;

  // Store in cache
  domainCache.set(hostname, {
    userId: record.userId,
    domain: record.domain,
    expiresAt: now + CACHE_TTL_MS,
  });

  return { userId: record.userId, domain: record.domain };
}
