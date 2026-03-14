import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  let transactions: Awaited<
    ReturnType<
      typeof prisma.transaction.findMany<{
        include: { user: { select: { email: true } }; deck: { select: { shareId: true; title: true } } };
      }>
    >
  >;
  try {
    transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true } }, deck: { select: { shareId: true, title: true } } },
    });
  } catch {
    redirect("/admin");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Transactions</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-700">ID</th>
              <th className="px-4 py-2 font-medium text-gray-700">Amount</th>
              <th className="px-4 py-2 font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 font-medium text-gray-700">Stripe</th>
              <th className="px-4 py-2 font-medium text-gray-700">User / Deck</th>
              <th className="px-4 py-2 font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">{t.id.slice(0, 8)}…</td>
                  <td className="px-4 py-2">
                    {(t.amountCents / 100).toFixed(2)} {t.currency}
                  </td>
                  <td className="px-4 py-2">{t.status}</td>
                  <td className="px-4 py-2 font-mono text-xs">{t.stripePaymentId?.slice(0, 20) ?? "—"}…</td>
                  <td className="px-4 py-2">
                    {t.user?.email ?? "—"} / {t.deck ? t.deck.shareId : "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
