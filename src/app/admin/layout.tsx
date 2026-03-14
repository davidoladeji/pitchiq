import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/admin" className="font-semibold text-gray-900">
            PitchIQ Admin
          </Link>
          <nav className="flex gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
              Users
            </Link>
            <Link href="/admin/transactions" className="text-gray-600 hover:text-gray-900">
              Transactions
            </Link>
            <Link href="/admin/settings" className="text-gray-600 hover:text-gray-900">
              Settings
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
