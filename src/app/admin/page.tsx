import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

function AdminSetupMessage({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <h2 className="mb-2 text-lg font-semibold text-amber-900">Setup required</h2>
      <p className="mb-2 text-sm text-amber-800">Admin cannot connect to the database or auth is not configured.</p>
      <p className="mb-4 font-mono text-xs text-amber-900">{error}</p>
      <ul className="list-inside list-disc text-sm text-amber-800">
        <li>Set <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> (PostgreSQL)</li>
        <li>Set <code className="rounded bg-amber-100 px-1">ADMIN_SESSION_SECRET</code> (min 32 chars)</li>
        <li>Run <code className="rounded bg-amber-100 px-1">npx prisma migrate deploy</code></li>
        <li>Create first admin: <code className="rounded bg-amber-100 px-1">POST /api/admin/seed</code> with email + password</li>
      </ul>
    </div>
  );
}

export default async function AdminDashboardPage() {
  let userCount: number;
  let transactionCount: number;
  let deckCount: number;
  try {
    [userCount, transactionCount, deckCount] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.deck.count(),
    ]);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Dashboard</h1>
        <AdminSetupMessage error={message} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-2xl font-semibold">{userCount}</p>
          <Link href="/admin/users" className="mt-2 text-sm text-blue-600 hover:underline">
            View →
          </Link>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-semibold">{transactionCount}</p>
          <Link href="/admin/transactions" className="mt-2 text-sm text-blue-600 hover:underline">
            View →
          </Link>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Decks</p>
          <p className="text-2xl font-semibold">{deckCount}</p>
        </div>
      </div>
    </div>
  );
}
