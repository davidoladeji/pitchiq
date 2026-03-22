/**
 * Atomic credit operations using Prisma transactions.
 * Provides balance queries, credit additions, deductions with idempotency,
 * and transaction history.
 */
import { prisma } from "@/lib/db";
import { getCreditCost } from "@/lib/payg-config";

// ---------------------------------------------------------------------------
// Balance
// ---------------------------------------------------------------------------

/**
 * Get the current credit balance for a user.
 * Returns 0 if no CreditBalance record exists.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const record = await prisma.creditBalance.findUnique({
    where: { userId },
  });
  return record?.balance ?? 0;
}

// ---------------------------------------------------------------------------
// Affordability check
// ---------------------------------------------------------------------------

/**
 * Check whether a user can afford a given action based on their credit balance.
 */
export async function canAffordAction(
  userId: string,
  action: string,
): Promise<boolean> {
  const balance = await getCreditBalance(userId);
  const cost = getCreditCost(action);
  return balance >= cost;
}

// ---------------------------------------------------------------------------
// Add credits
// ---------------------------------------------------------------------------

/**
 * Add credits to a user's balance atomically.
 * Creates the CreditBalance record if it doesn't exist (upsert).
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: string,
  metadata?: {
    packId?: string;
    stripePaymentId?: string;
    amountCents?: number;
    description?: string;
  },
): Promise<{ newBalance: number }> {
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.creditBalance.upsert({
      where: { userId },
      create: {
        userId,
        balance: amount,
        lifetime: amount,
      },
      update: {
        balance: { increment: amount },
        lifetime: { increment: amount },
      },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        type,
        amount,
        balanceAfter: updated.balance,
        packId: metadata?.packId,
        stripePaymentId: metadata?.stripePaymentId,
        amountCents: metadata?.amountCents,
        description: metadata?.description,
      },
    });

    return updated.balance;
  });

  return { newBalance: result };
}

// ---------------------------------------------------------------------------
// Deduct credits
// ---------------------------------------------------------------------------

/**
 * Deduct credits for an action atomically.
 *
 * Includes an idempotency check: if the same userId + action + resourceId
 * was recorded within the last hour, the deduction is skipped and the
 * current balance is returned as a successful no-op.
 *
 * If the action has zero cost, returns success without any transaction.
 */
export async function deductCredits(
  userId: string,
  action: string,
  resourceId?: string,
  description?: string,
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const cost = getCreditCost(action);

  // Zero-cost actions always succeed
  if (cost === 0) {
    const balance = await getCreditBalance(userId);
    return { success: true, newBalance: balance };
  }

  // Idempotency check — skip if same action+resource recorded within 1 hour
  if (resourceId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await prisma.creditTransaction.findFirst({
      where: {
        userId,
        action,
        resourceId,
        createdAt: { gte: oneHourAgo },
      },
    });
    if (existing) {
      const balance = await getCreditBalance(userId);
      return { success: true, newBalance: balance };
    }
  }

  // Atomic deduction
  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.creditBalance.findUnique({
      where: { userId },
    });

    const currentBalance = record?.balance ?? 0;

    if (currentBalance < cost) {
      return {
        success: false as const,
        newBalance: currentBalance,
        error: "Insufficient credits",
      };
    }

    const updated = await tx.creditBalance.update({
      where: { userId },
      data: { balance: { decrement: cost } },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        type: "usage",
        amount: -cost,
        balanceAfter: updated.balance,
        action,
        resourceId,
        description,
      },
    });

    return { success: true as const, newBalance: updated.balance };
  });

  return result;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/**
 * Retrieve credit transaction history for a user.
 */
export async function getCreditHistory(
  userId: string,
  options?: {
    type?: string;
    limit?: number;
    offset?: number;
  },
): Promise<
  Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    action: string | null;
    resourceId: string | null;
    description: string | null;
    packId: string | null;
    createdAt: Date;
  }>
> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const where: { userId: string; type?: string } = { userId };
  if (options?.type) {
    where.type = options.type;
  }

  return prisma.creditTransaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}
