/**
 * Stripe client using key from env or admin Setting. Never expose secret to client.
 */
import Stripe from "stripe";
import { prisma } from "@/lib/db";

let cachedStripe: Stripe | null = null;

async function getSecretKey(): Promise<string> {
  const fromEnv = process.env.STRIPE_SECRET_KEY;
  if (fromEnv) return fromEnv;
  const row = await prisma.setting.findUnique({
    where: { key: "stripe_secret_key" },
  });
  if (row?.value) return row.value;
  throw new Error("Stripe secret key not configured. Set in admin Settings or STRIPE_SECRET_KEY env.");
}

export async function getStripe(): Promise<Stripe> {
  if (cachedStripe) return cachedStripe;
  const secret = await getSecretKey();
  cachedStripe = new Stripe(secret);
  return cachedStripe;
}

/** Call after admin updates stripe_secret_key so next request uses new key */
export function clearStripeCache(): void {
  cachedStripe = null;
}
