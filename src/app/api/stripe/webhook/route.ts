import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

/**
 * Stripe webhook: create Transaction on successful payment.
 * Configure STRIPE_WEBHOOK_SECRET in env and set endpoint in Stripe Dashboard.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = await getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    const amount = session.amount_total ?? 0;
    const currency = session.currency ?? "usd";
    const deckId = session.metadata?.deckId ?? null;

    await prisma.transaction.create({
      data: {
        stripePaymentId: paymentIntentId || session.id,
        amountCents: amount,
        currency,
        status: "succeeded",
        deckId: deckId || undefined,
      },
    });
  }

  return NextResponse.json({ received: true });
}
