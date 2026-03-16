import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_LOGIN = "/admin/login";
const SESSION_COOKIE = "pitchiq_admin_session";

// ---------------------------------------------------------------------------
// Hostnames that belong to the main PitchIQ app (not custom domains)
// ---------------------------------------------------------------------------
function isMainAppHost(hostname: string): boolean {
  // localhost / 127.0.0.1 during development
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("localhost:") ||
    hostname.startsWith("127.0.0.1:")
  )
    return true;

  // Derive from NEXT_PUBLIC_APP_URL when available
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      const parsed = new URL(appUrl);
      if (hostname === parsed.hostname || hostname === parsed.host) return true;
    } catch {
      // ignore invalid URL
    }
  }

  // Common pitchiq patterns
  if (
    hostname.endsWith(".pitchiq.com") ||
    hostname === "pitchiq.com" ||
    hostname.endsWith(".vercel.app")
  )
    return true;

  return false;
}

// ---------------------------------------------------------------------------
// Simple edge-compatible in-memory cache for custom domain lookups
// ---------------------------------------------------------------------------
interface CachedLookup {
  isCustomDomain: boolean;
  expiresAt: number;
}

const DOMAIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const edgeDomainCache = new Map<string, CachedLookup>();

async function isKnownCustomDomain(
  hostname: string,
  requestUrl: string
): Promise<boolean> {
  const now = Date.now();
  const cached = edgeDomainCache.get(hostname);
  if (cached && cached.expiresAt > now) return cached.isCustomDomain;

  // Call our own internal API to check (edge-safe, no Prisma)
  try {
    const origin = new URL(requestUrl).origin;
    const res = await fetch(
      `${origin}/api/custom-domain/lookup?hostname=${encodeURIComponent(hostname)}`,
      { method: "GET", headers: { "x-middleware-check": "1" } }
    );
    const isCustom = res.ok && (await res.json()).found === true;
    edgeDomainCache.set(hostname, {
      isCustomDomain: isCustom,
      expiresAt: now + DOMAIN_CACHE_TTL,
    });
    return isCustom;
  } catch {
    // On error, assume it's not a custom domain so we don't break normal flow
    return false;
  }
}

// ---------------------------------------------------------------------------
// Admin session validation (unchanged)
// ---------------------------------------------------------------------------
function isValidSessionStructure(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const raw = JSON.parse(decoded);
    if (!raw.data || !raw.sig) return false;
    const payload = JSON.parse(raw.data);
    if (!payload.email && !payload.userId) return false;
    if (typeof payload.exp !== "number" || payload.exp <= Date.now())
      return false;
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const hostname = req.headers.get("host") || req.nextUrl.hostname;

  // ── Admin route protection (existing logic, preserved) ──────────────
  if (path.startsWith("/admin")) {
    if (path === ADMIN_LOGIN) return NextResponse.next();

    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !isValidSessionStructure(token)) {
      const login = new URL(ADMIN_LOGIN, req.url);
      login.searchParams.set("from", path);
      const response = NextResponse.redirect(login);
      if (token) {
        response.cookies.delete(SESSION_COOKIE);
      }
      return response;
    }

    return NextResponse.next();
  }

  // ── Custom domain rewriting ─────────────────────────────────────────
  if (!isMainAppHost(hostname)) {
    const isCustom = await isKnownCustomDomain(hostname, req.url);

    if (isCustom) {
      // Root path on custom domain → redirect to main site
      if (path === "/" || path === "") {
        const mainUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pitchiq.com";
        return NextResponse.redirect(mainUrl);
      }

      // Rewrite /{shareId} → /deck/{shareId} so the app resolves the deck page
      const shareId = path.slice(1); // strip leading "/"
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = `/deck/${shareId}`;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon).*)"],
};
