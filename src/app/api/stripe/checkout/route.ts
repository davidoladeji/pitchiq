import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * Stripe price IDs — create these in your Stripe Dashboard:
 *   Pro:    $29/mo recurring
 *   Growth: $79/mo recurring
 *
 * Set via env vars or fall back to lookup by product metadata.
 */
const PLAN_PRICES: Record<string, { priceId?: string; amount: number; name: string }> = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    amount: 2900,
    name: "PitchIQ Pro",
  },
  growth: {
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    amount: 7900,
    name: "PitchIQ Growth",
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Sign in to upgrade your plan" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    const body = await req.json();
    const { plan } = body as { plan: string };

    const planConfig = PLAN_PRICES[plan];
    if (!planConfig) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'pro' or 'growth'." },
        { status: 400 }
      );
    }

    const stripe = await getStripe();
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get or create Stripe customer
    let customerId: string | undefined;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true, email: true, name: true },
      });

      if (user?.stripeCustomerId) {
        customerId = user.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: session.user.email,
          name: session.user.name || undefined,
          metadata: { userId: userId || "" },
        });
        customerId = customer.id;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id },
          });
        }
      }
    }

    // Build line items — use priceId if set, otherwise use price_data
    const lineItems = planConfig.priceId
      ? [{ price: planConfig.priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              unit_amount: planConfig.amount,
              recurring: { interval: "month" as const },
              product_data: {
                name: planConfig.name,
                description: `${planConfig.name} monthly subscription`,
              },
            },
            quantity: 1,
          },
        ];

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: lineItems,
      success_url: `${base}/dashboard?upgraded=${plan}`,
      cancel_url: `${base}/#pricing`,
      metadata: {
        userId: userId || "",
        plan,
      },
      subscription_data: {
        metadata: {
          userId: userId || "",
          plan,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
