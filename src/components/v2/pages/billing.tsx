"use client";

import Link from "next/link";
import { CreditCard, CheckCircle, X, Coins, CalendarClock, ArrowRight } from "lucide-react";

import { formatCurrency } from "@/lib/cn";
import {
  mockPlanInfo,
  mockInvoices,
  mockPlanFeatures,
} from "@/lib/mock-data";

import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/v2/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/v2/ui/table";

/* ────────────────────── Plan column config ───────────────── */

const PLANS = [
  { key: "starter" as const, name: "Starter", price: "Free" },
  { key: "pro" as const, name: "Pro", price: "$9/mo" },
  { key: "growth" as const, name: "Growth", price: "$29/mo" },
  { key: "enterprise" as const, name: "Enterprise", price: "$99/mo" },
];

const CURRENT_PLAN = "growth";

/* ────────────────────── Feature cell ─────────────────────── */

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-neutral-700">{value}</span>;
  }
  return value ? (
    <CheckCircle className="h-4 w-4 text-success-500" />
  ) : (
    <X className="h-4 w-4 text-neutral-300" />
  );
}

/* ────────────────────── Invoice status badge ─────────────── */

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "paid"
      ? "success"
      : status === "pending"
        ? "warning"
        : "error";
  return (
    <Badge variant={variant as "success" | "warning" | "error"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

/* ═══════════════════════ Billing Page ════════════════════════ */

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <h1 className="text-2xl font-bold text-neutral-900">
        Billing &amp; Plans
      </h1>

      {/* ─── Section 1: Current Plan ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-primary-700">
                {mockPlanInfo.name}
              </p>
              <p className="text-lg text-neutral-700">
                ${mockPlanInfo.price}/{mockPlanInfo.interval}
              </p>
              <p className="text-sm text-neutral-500">
                Renews on{" "}
                {new Date(mockPlanInfo.renewalDate).toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" },
                )}
              </p>
            </div>
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Section 2: Payment Method ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-neutral-500" />
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  {mockPlanInfo.cardBrand} ending in {mockPlanInfo.cardLast4}
                </p>
                <p className="text-xs text-neutral-400">Expires 12/2028</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Section 2b: Pay As You Go ─── */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">
          Pay As You Go
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          No commitment &mdash; use PitchIQ when you need it
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Period Passes */}
          <Card>
            <CardContent className="py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <CalendarClock size={20} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    Period Passes
                  </p>
                  <p className="text-lg font-bold text-primary-700">
                    From $5/day
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Get temporary access to Pro, Growth, or Enterprise features
                  </p>
                  <Link
                    href="/dashboard/credits"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                  >
                    View Passes
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits */}
          <Card>
            <CardContent className="py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <Coins size={20} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    Credits
                  </p>
                  <p className="text-lg font-bold text-primary-700">
                    From $0.99/credit
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Pay per action &mdash; AI coaching, exports, investor matching
                  </p>
                  <Link
                    href="/dashboard/credits"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                  >
                    Buy Credits
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Section 3: Compare Plans ─── */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Compare Plans
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === CURRENT_PLAN;
            const planIndex = PLANS.findIndex((p) => p.key === plan.key);
            const currentIndex = PLANS.findIndex(
              (p) => p.key === CURRENT_PLAN,
            );

            return (
              <Card
                key={plan.key}
                className={
                  isCurrent
                    ? "border-primary-300 ring-1 ring-primary-200"
                    : ""
                }
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-lg font-bold text-neutral-900">
                    {plan.price}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Features list */}
                  <ul className="space-y-2">
                    {mockPlanFeatures.map((f) => (
                      <li
                        key={f.name}
                        className="flex items-center gap-2 text-sm"
                      >
                        <FeatureCell value={f[plan.key]} />
                        <span className="text-neutral-600">{f.name}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="pt-3">
                    {isCurrent ? (
                      <Badge variant="primary" className="w-full justify-center py-1.5">
                        Current Plan
                      </Badge>
                    ) : planIndex < currentIndex ? (
                      <Button variant="ghost" className="w-full">
                        Downgrade
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        Upgrade
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ─── Section 4: Invoice History ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    {new Date(inv.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{formatCurrency(inv.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
