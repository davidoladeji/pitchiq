"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";

/**
 * v2 Billing Page — wraps the existing BillingClient in the new app shell.
 */
import BillingClientClassic from "@/components/BillingClient";

interface Props {
  plan: string;
  hasSubscription: boolean;
  planExpiresAt: string | null;
  memberSince: string | null;
  deckCount: number;
  userName?: string;
}

export default function BillingV2({ userName, ...props }: Props) {
  return (
    <AppShellV2
      userName={userName}
      userPlan={props.plan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Billing" },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <DashboardVersionToggle />

        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white mb-1">Billing</h1>
          <p className="text-sm text-navy-500 dark:text-white/50">Manage your subscription and payment details</p>
        </div>

        <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-5">
          <BillingClientClassic {...props} />
        </div>
      </div>
    </AppShellV2>
  );
}
