import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_LOGIN = "/admin/login";
const SESSION_COOKIE = "pitchiq_admin_session";

function isValidSessionStructure(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const raw = JSON.parse(decoded);
    if (!raw.data || !raw.sig) return false;
    const payload = JSON.parse(raw.data);
    if (!payload.email && !payload.userId) return false;
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!path.startsWith("/admin")) return NextResponse.next();
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

export const config = {
  matcher: ["/admin/:path*"],
};
