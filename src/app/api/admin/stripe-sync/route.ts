import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let synced = 0;
  let removed = 0;

  try {
    const stripe = await getStripe();

    // ── Step 1: Delete all existing transactions so we rebuild from Stripe truth ──
    const { count: deletedCount } = await prisma.transaction.deleteMany({});
    removed = deletedCount;

    // ── Step 2: Fetch payment intents (the single source of truth) ────────────
    // Payment intents are the canonical Stripe object for payments.
    // Each real payment attempt produces exactly one payment intent.
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      expand: ["data.invoice", "data.customer"],
    });

    for (const pi of paymentIntents.data) {
      // Resolve user by customer email or customer ID
      let userId: string | null = null;

      // Try customer ID lookup first
      const custId =
        typeof pi.customer === "string"
          ? pi.customer
          : pi.customer?.id ?? null;

      if (custId) {
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: custId },
          select: { id: true },
        });
        if (user) userId = user.id;
      }

      // Fall back to email from charges
      if (!userId && pi.latest_charge) {
        try {
          const chargeId =
            typeof pi.latest_charge === "string"
              ? pi.latest_charge
              : pi.latest_charge.id;
          const charge = await stripe.charges.retrieve(chargeId);
          if (charge.billing_details?.email) {
            const user = await prisma.user.findUnique({
              where: { email: charge.billing_details.email },
              select: { id: true },
            });
            if (user) userId = user.id;
          }
        } catch {
          // charge lookup failed, continue without user
        }
      }

      // Map PI status to our transaction status
      let status: string;
      switch (pi.status) {
        case "succeeded":
          status = "succeeded";
          break;
        case "canceled":
          status = "failed";
          break;
        case "requires_payment_method":
          status = "failed";
          break;
        case "processing":
          status = "pending";
          break;
        default:
          status = "pending";
      }

      await prisma.transaction.create({
        data: {
          stripePaymentId: pi.id,
          amountCents: pi.amount,
          currency: pi.currency,
          status,
          userId,
          createdAt: new Date(pi.created * 1000),
        },
      });
      synced++;
    }

    return NextResponse.json({ ok: true, synced, removed });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error syncing from Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
