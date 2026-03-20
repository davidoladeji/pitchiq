import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = await getStripe();
    const events = await stripe.events.list({ limit: 5 });
    return NextResponse.json({
      ok: true,
      eventCount: events.data.length,
      hasMore: events.has_more,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error connecting to Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
