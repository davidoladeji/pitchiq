import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { DEFAULT_PASS_TIERS, calculatePassPrice } from "@/lib/payg-config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to purchase a pass" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { tier: tierId, durationDays } = body as {
      tier: string;
      durationDays: number;
    };

    // Validate tier
    const tier = DEFAULT_PASS_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json(
        { error: "Invalid tier. Choose 'basic', 'growth', or 'full'." },
        { status: 400 },
      );
    }

    // Validate durationDays
    if (
      !Number.isInteger(durationDays) ||
      durationDays < 1 ||
      durationDays > 90
    ) {
      return NextResponse.json(
        { error: "durationDays must be a positive integer, max 90." },
        { status: 400 },
      );
    }

    const price = calculatePassPrice(tier, durationDays);

    const stripe = await getStripe();
    const origin = new URL(req.url).origin;

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session?.user?.email || undefined,
        name: session?.user?.name || undefined,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: price,
            product_data: {
              name: `${tier.name} — ${durationDays} day${durationDays > 1 ? "s" : ""}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        tier: tier.id,
        durationDays: String(durationDays),
        type: "period_pass",
      },
      success_url: `${origin}/dashboard?pass_activated=${tier.id}`,
      cancel_url: `${origin}/#pricing`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (e) {
    console.error("Pass checkout error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
