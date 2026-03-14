import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * POST: create Stripe Checkout session for premium.
 * Body: { amountCents?, currency?, deckId?, successUrl, cancelUrl }
 * Keys from env or admin Settings; never exposed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amountCents = 999,
      currency = "usd",
      deckId,
      successUrl,
      cancelUrl,
    } = body as {
      amountCents?: number;
      currency?: string;
      deckId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const success = successUrl || `${base}/admin?paid=1`;
    const cancel = cancelUrl || `${base}/`;

    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amountCents,
            product_data: {
              name: "PitchIQ Premium",
              description: "Premium analytics & features",
            },
          },
          quantity: 1,
        },
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: deckId ? { deckId } : {},
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
