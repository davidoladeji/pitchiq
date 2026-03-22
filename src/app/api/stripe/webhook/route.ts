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

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("Payment failed for customer:", invoice.customer);
        break;
      }
    }
  } catch (e) {
    console.error(`[Webhook] Handler error for ${event.type}:`, e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Resolve a userId from Stripe session/subscription metadata,
 * falling back to customer lookup if metadata is missing.
 */
async function resolveUserId(
  metadataUserId: string | undefined | null,
  customerId: string | null | Stripe.Customer | Stripe.DeletedCustomer
): Promise<string | null> {
  // 1. Try metadata first
  if (metadataUserId && metadataUserId.trim().length > 0) {
    return metadataUserId;
  }

  // 2. Fall back to looking up user by Stripe customer ID
  const custId =
    typeof customerId === "string"
      ? customerId
      : customerId && "id" in customerId
        ? customerId.id
        : null;

  if (custId) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: custId },
      select: { id: true },
    });
    if (user) {
      console.log(`[Webhook] Resolved userId ${user.id} from customer ${custId}`);
      return user.id;
    }
  }

  return null;
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const plan = session.metadata?.plan || "pro";
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const userId = await resolveUserId(
    session.metadata?.userId,
    session.customer
  );

  if (!userId) {
    console.error(
      `[Webhook] checkout.session.completed: could not resolve userId. ` +
      `metadata=${JSON.stringify(session.metadata)}, customer=${session.customer}, session=${session.id}`
    );
  }

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

    console.log(`[Webhook] checkout.session.completed: user ${userId} upgraded to ${plan}`);
  } else if (userId && !subscriptionId) {
    // Payment succeeded but subscription ID missing — still update plan
    console.warn(
      `[Webhook] checkout.session.completed: subscriptionId missing, updating plan anyway. ` +
      `userId=${userId}, session=${session.id}`
    );
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        stripeCustomerId:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id || undefined,
      },
    });

    await prisma.deck.updateMany({
      where: { userId },
      data: { isPremium: true },
    });
  }

  // Record transaction — use payment intent as canonical ID to avoid duplicates
  const piId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const txnStripeId = piId || subscriptionId || session.id;

  // Avoid duplicate if sync already created one for this payment intent
  const existingTxn = await prisma.transaction.findFirst({
    where: { stripePaymentId: txnStripeId },
  });
  if (!existingTxn) {
    await prisma.transaction.create({
      data: {
        stripePaymentId: txnStripeId,
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: "succeeded",
        userId: userId || undefined,
      },
    });
  }
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
  const userId = await resolveUserId(
    subscription.metadata?.userId,
    subscription.customer
  );

  if (!userId) {
    console.warn(
      `[Webhook] customer.subscription.updated: could not resolve userId. ` +
      `metadata=${JSON.stringify(subscription.metadata)}, customer=${subscription.customer}, sub=${subscription.id}`
    );
    return;
  }

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

  console.log(
    `[Webhook] subscription.updated: user ${userId} → ${isActive ? plan : "starter"} (status: ${subscription.status})`
  );
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) {
    console.warn("[Webhook] invoice.payment_succeeded missing customer ID");
    return;
  }

  // Skip the very first invoice from a new subscription — that payment is
  // already recorded by the checkout.session.completed handler.
  if (invoice.billing_reason === "subscription_create") {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawPI = (invoice as any).payment_intent;
  const paymentIntentId =
    typeof rawPI === "string" ? rawPI : rawPI?.id as string | undefined;

  // Avoid duplicate transaction records
  if (paymentIntentId) {
    const existing = await prisma.transaction.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });
    if (existing) return;
  }

  // Look up user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  await prisma.transaction.create({
    data: {
      stripePaymentId: paymentIntentId || invoice.id,
      amountCents: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? "usd",
      status: "succeeded",
      userId: user?.id || undefined,
    },
  });

  console.log(
    `[Webhook] Recorded invoice payment: ${paymentIntentId || invoice.id} for customer ${customerId}`
  );
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = await resolveUserId(
    subscription.metadata?.userId,
    subscription.customer
  );

  if (!userId) {
    console.warn(
      `[Webhook] subscription.deleted: could not resolve userId. ` +
      `metadata=${JSON.stringify(subscription.metadata)}, customer=${subscription.customer}`
    );
    return;
  }

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

  console.log(`[Webhook] subscription.deleted: user ${userId} downgraded to starter`);
}
