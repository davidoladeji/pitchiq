import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

/**
 * Stripe webhook handler for subscription lifecycle events.
 * Configure STRIPE_WEBHOOK_SECRET in env and set endpoint in Stripe Dashboard.
 * Events to subscribe to:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_succeeded
 *   - invoice.payment_failed
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleSubscriptionCheckout(session);
        } else {
          // Legacy one-time payment
          await handleOneTimePayment(session);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("Payment failed for customer:", invoice.customer);
        break;
      }
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    // Return 200 to avoid Stripe retries for handler errors
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan || "pro";
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (userId && subscriptionId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id || undefined,
      },
    });

    // Mark all user's decks as premium
    await prisma.deck.updateMany({
      where: { userId },
      data: { isPremium: true },
    });
  }

  // Record transaction
  await prisma.transaction.create({
    data: {
      stripePaymentId: subscriptionId || session.id,
      amountCents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "succeeded",
      userId: userId || undefined,
    },
  });
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const deckId = session.metadata?.deckId ?? null;

  await prisma.transaction.create({
    data: {
      stripePaymentId: paymentIntentId || session.id,
      amountCents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "succeeded",
      deckId: deckId || undefined,
    },
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const isActive = ["active", "trialing"].includes(subscription.status);
  const plan = subscription.metadata?.plan || "pro";

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: isActive ? plan : "starter",
      stripeSubscriptionId: subscription.id,
      planExpiresAt: (subscription as unknown as { current_period_end?: number }).current_period_end
        ? new Date(((subscription as unknown as { current_period_end: number }).current_period_end) * 1000)
        : null,
    },
  });

  // Update deck premium status
  await prisma.deck.updateMany({
    where: { userId },
    data: { isPremium: isActive },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "starter",
      stripeSubscriptionId: null,
      planExpiresAt: null,
    },
  });

  // Remove premium from all decks
  await prisma.deck.updateMany({
    where: { userId },
    data: { isPremium: false },
  });
}
