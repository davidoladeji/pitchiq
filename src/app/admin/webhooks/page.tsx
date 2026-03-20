import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import WebhookTestButtonClient from "./WebhookTestButtonClient";

export const dynamic = "force-dynamic";

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
] as const;

const STATUS_STYLES: Record<string, string> = {
  succeeded: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-red-500/15 text-red-400",
  refunded: "bg-blue-500/15 text-blue-400",
};

function inferType(stripePaymentId: string | null): string {
  if (!stripePaymentId) return "unknown";
  if (stripePaymentId.startsWith("cs_")) return "checkout";
  if (stripePaymentId.startsWith("pi_")) return "payment_intent";
  if (stripePaymentId.startsWith("in_")) return "invoice";
  if (stripePaymentId.startsWith("sub_")) return "subscription";
  if (stripePaymentId.startsWith("ch_")) return "charge";
  return "other";
}

export default async function AdminWebhooksPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const webhookSecretSet = !!process.env.STRIPE_WEBHOOK_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/stripe/webhook`;

  let transactions: Awaited<
    ReturnType<
      typeof prisma.transaction.findMany<{
        include: { user: { select: { email: true } } };
      }>
    >
  > = [];

  try {
    transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { email: true } },
      },
    });
  } catch {
    // DB may not be available
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhook Configuration</h1>
          <p className="text-sm text-white/30 mt-1">Stripe webhook status and diagnostics</p>
        </div>
        <WebhookTestButtonClient />
      </div>

      {/* Configuration Status */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Configuration Status</h2>

        <div className="grid gap-3">
          {/* Webhook Secret */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                webhookSecretSet ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span className="text-sm text-white/70">
              STRIPE_WEBHOOK_SECRET:{" "}
              <span className={`font-semibold ${webhookSecretSet ? "text-emerald-400" : "text-red-400"}`}>
                {webhookSecretSet ? "Configured" : "Not configured"}
              </span>
            </span>
          </div>

          {/* Webhook URL */}
          <div className="flex items-start gap-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#4361EE] mt-1.5" />
            <div>
              <span className="text-sm text-white/70">Webhook URL:</span>
              <code className="block mt-1 text-xs font-mono text-[#4361EE] bg-white/5 rounded-lg px-3 py-2 select-all">
                {webhookUrl}
              </code>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="pt-2">
          <p className="text-sm text-white/50 mb-2">Subscribed events:</p>
          <div className="flex flex-wrap gap-2">
            {WEBHOOK_EVENTS.map((evt) => (
              <span
                key={evt}
                className="inline-flex items-center rounded-lg bg-white/5 px-2.5 py-1 text-xs font-mono text-white/50"
              >
                {evt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Webhook Events (Transactions as proxy) */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Webhook Activity</h2>
          <p className="text-xs text-white/30 mt-0.5">Last 20 transactions (proxy for webhook events)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Timestamp</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Stripe ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-white/30 text-sm">
                    No transactions found. Webhooks may not be delivering events.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-xs text-white/40">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/50">
                        {inferType(t.stripePaymentId)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          STATUS_STYLES[t.status] || "bg-white/5 text-white/30"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-white">
                      ${(t.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-white/30">
                      {t.stripePaymentId ? `${t.stripePaymentId.slice(0, 24)}...` : "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Troubleshooting Guide */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Troubleshooting Guide</h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-400">No transactions showing?</h3>
            <ul className="text-sm text-white/50 space-y-1 list-disc list-inside ml-1">
              <li>
                Verify <code className="text-white/70 font-mono text-xs">STRIPE_WEBHOOK_SECRET</code> is set in your
                environment variables
              </li>
              <li>Confirm the webhook URL is correctly configured in your Stripe Dashboard</li>
              <li>Use the &quot;Test Connection&quot; button above to verify Stripe API connectivity</li>
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-400">Webhook URL format</h3>
            <p className="text-sm text-white/50">
              Configure this exact URL in{" "}
              <span className="text-white/70">Stripe Dashboard &rarr; Developers &rarr; Webhooks</span>:
            </p>
            <code className="block mt-1 text-xs font-mono text-[#4361EE] bg-white/5 rounded-lg px-3 py-2 select-all">
              {webhookUrl}
            </code>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-400">Required events</h3>
            <p className="text-sm text-white/50">Subscribe to all 5 of these events in your Stripe webhook:</p>
            <ol className="text-sm text-white/50 space-y-0.5 list-decimal list-inside ml-1 font-mono">
              {WEBHOOK_EVENTS.map((evt) => (
                <li key={evt}>{evt}</li>
              ))}
            </ol>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-400">Testing locally?</h3>
            <p className="text-sm text-white/50">
              Use the Stripe CLI to forward events to your local server:
            </p>
            <code className="block mt-1 text-xs font-mono text-white/60 bg-white/5 rounded-lg px-3 py-2 select-all">
              stripe listen --forward-to localhost:3000/api/stripe/webhook
            </code>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div>
        <Link
          href="/admin/transactions"
          className="text-sm text-[#4361EE] hover:text-[#4361EE]/80 transition-colors"
        >
          &larr; Back to Transactions
        </Link>
      </div>
    </div>
  );
}
