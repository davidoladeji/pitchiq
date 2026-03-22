import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { DEFAULT_CREDIT_PACKS } from "@/lib/payg-config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to purchase credits" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { packId } = body as { packId: string };

    // Validate pack
    const pack = DEFAULT_CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) {
      return NextResponse.json(
        { error: "Invalid credit pack." },
        { status: 400 },
      );
    }

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
            unit_amount: pack.priceCents,
            product_data: {
              name: `${pack.name}${pack.bonus > 0 ? ` (+${pack.bonus} bonus)` : ""}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        packId: pack.id,
        credits: String(pack.credits),
        bonus: String(pack.bonus),
        type: "credit_purchase",
      },
      success_url: `${origin}/dashboard/credits?purchased=${pack.id}`,
      cancel_url: `${origin}/#pricing`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (e) {
    console.error("Credit checkout error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
