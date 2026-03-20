import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  let users;
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        suspended: true,
        suspendedAt: true,
        suspendedReason: true,
        lastSeenAt: true,
        createdAt: true,
        stripeSubscriptionId: true,
        _count: { select: { decks: true } },
      },
    });
  } catch {
    redirect("/admin");
  }

  const serialized = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as string,
    plan: u.plan,
    suspended: u.suspended,
    suspendedAt: u.suspendedAt?.toISOString() || null,
    suspendedReason: u.suspendedReason,
    lastSeenAt: u.lastSeenAt?.toISOString() || null,
    createdAt: u.createdAt.toISOString(),
    hasSubscription: !!u.stripeSubscriptionId,
    deckCount: u._count.decks,
  }));

  return <AdminUsersClient initialUsers={serialized} />;
}
