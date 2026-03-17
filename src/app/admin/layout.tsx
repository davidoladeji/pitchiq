import Link from "next/link";
import { cookies } from "next/headers";
import { AdminLogoutButton } from "./AdminLogoutButton";
import AdminSidebarNav from "./AdminSidebarNav";

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "pitchiq_admin_session";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check for admin session cookie — hide sidebar on login page
  const cookieStore = cookies();
  const hasSession = !!cookieStore.get(SESSION_COOKIE)?.value;

  if (!hasSession) {
    // Render just the content without sidebar (login page)
    return (
      <div className="min-h-screen bg-navy-950">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-navy-900 border-r border-white/5 flex-col shrink-0 fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric to-violet flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-sm">PitchIQ</span>
              <span className="block text-[10px] text-white/30 uppercase tracking-wider font-semibold">Admin</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <AdminSidebarNav />

        {/* Bottom section */}
        <div className="mt-auto p-4 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View Site
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-navy-900 border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric to-violet flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">Admin</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {[
              { href: "/admin", label: "Home" },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/decks", label: "Decks" },
              { href: "/admin/transactions", label: "Txns" },
              { href: "/admin/references", label: "Refs" },
              { href: "/admin/settings", label: "Settings" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 py-1.5 rounded-lg text-white/50 hover:text-white text-xs font-medium transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 min-w-0 pt-14 lg:pt-0 lg:ml-64"
        aria-label="Main content"
      >
        <div className="p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
