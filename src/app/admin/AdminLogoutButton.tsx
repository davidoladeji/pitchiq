"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Log out of admin"
      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 text-gray-600 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      Logout
    </button>
  );
}
