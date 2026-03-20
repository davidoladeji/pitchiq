import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TransactionActions from "./TransactionActions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  succeeded: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-red-500/15 text-red-400",
  refunded: "bg-blue-500/15 text-blue-400",
};

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
  let totalRevenue = 0;
  try {
    const [txns, agg] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          user: { select: { email: true } },
          deck: { select: { shareId: true, title: true } },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amountCents: true },
        where: { status: "succeeded" },
      }),
    ]);
    transactions = txns;
    totalRevenue = (agg._sum.amountCents || 0) / 100;
  } catch {
    redirect("/admin");
  }

  const succeededCount = transactions.filter((t) => t.status === "succeeded").length;

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <TransactionActions />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-white/30 mt-1">{transactions.length} recent transactions</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Total Revenue</p>
            <p className="text-lg font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Succeeded</p>
            <p className="text-lg font-bold text-white">{succeededCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Stripe ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">User / Deck</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/30 text-sm">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-white/40">{t.id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-white">
                        ${(t.amountCents / 100).toFixed(2)}
                      </span>
                      <span className="text-xs text-white/30 ml-1 uppercase">{t.currency}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[t.status] || "bg-white/5 text-white/30"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-white/30">
                        {t.stripePaymentId ? `${t.stripePaymentId.slice(0, 20)}...` : "--"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-xs text-white/60">{t.user?.email || "Unknown"}</p>
                        <p className="text-xs text-white/25">{t.deck?.title || "--"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-white/30">
                        {new Date(t.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
