import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";

export const dynamic = "force-dynamic";

const navLinkClass =
  "min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 text-gray-600 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:outline-none";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-electric focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <header
        className="border-b bg-white px-4 py-3"
        aria-label="Admin header"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/admin"
            className="font-semibold text-gray-900 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            PitchIQ Admin
          </Link>
          <nav className="flex gap-1" aria-label="Admin navigation">
            <Link href="/admin" className={navLinkClass}>
              Dashboard
            </Link>
            <Link href="/admin/users" className={navLinkClass}>
              Users
            </Link>
            <Link href="/admin/transactions" className={navLinkClass}>
              Transactions
            </Link>
            <Link href="/admin/settings" className={navLinkClass}>
              Settings
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <main
        id="main"
        className="mx-auto max-w-6xl px-4 py-6"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
