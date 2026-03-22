import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminPaygClient from "./AdminPaygClient";

export const dynamic = "force-dynamic";

export default async function AdminPaygPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
  return <AdminPaygClient />;
}
