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

  try {
    const stripe = await getStripe();

    // Sync from charges
    const charges = await stripe.charges.list({ limit: 20 });
    for (const charge of charges.data) {
      const stripePaymentId = charge.id;
      const existing = await prisma.transaction.findFirst({
        where: { stripePaymentId },
      });
      if (!existing) {
        // Try to find user by Stripe customer email
        let userId: string | null = null;
        if (charge.billing_details?.email) {
          const user = await prisma.user.findUnique({
            where: { email: charge.billing_details.email },
          });
          if (user) userId = user.id;
        }

        await prisma.transaction.create({
          data: {
            stripePaymentId,
            amountCents: charge.amount,
            currency: charge.currency,
            status: charge.status === "succeeded" ? "succeeded" : charge.status === "failed" ? "failed" : "pending",
            userId,
          },
        });
        synced++;
      }
    }

    // Sync from invoices
    const invoices = await stripe.invoices.list({ limit: 20 });
    for (const invoice of invoices.data) {
      const stripePaymentId = invoice.id;
      const existing = await prisma.transaction.findFirst({
        where: { stripePaymentId },
      });
      if (!existing && invoice.amount_paid > 0) {
        let userId: string | null = null;
        if (invoice.customer_email) {
          const user = await prisma.user.findUnique({
            where: { email: invoice.customer_email },
          });
          if (user) userId = user.id;
        }

        await prisma.transaction.create({
          data: {
            stripePaymentId,
            amountCents: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status === "paid" ? "succeeded" : invoice.status === "open" ? "pending" : "failed",
            userId,
          },
        });
        synced++;
      }
    }

    return NextResponse.json({ ok: true, synced });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error syncing from Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
