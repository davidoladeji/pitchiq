import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminUsersTable from "@/components/AdminUsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  let users: { id: string; email: string; role: string; plan: string; createdAt: Date }[];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, plan: true, createdAt: true },
    });
  } catch {
    redirect("/admin");
  }

  // Serialize dates for client component
  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Users</h1>
      <AdminUsersTable initialUsers={serializedUsers} />
    </div>
  );
}
