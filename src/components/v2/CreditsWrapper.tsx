"use client";
import AppShellV2 from "./shell/AppShell";

// Lazy-import the existing credits page content to avoid circular deps
import { useState, useEffect } from "react";
import Link from "next/link";
import { Coins, ShoppingCart, ArrowUpRight, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface PaygStatus {
  creditBalance: number;
  lifetimeCredits: number;
  activePass?: { planKey: string; expiresAt: string };
  transactions: { id: string; type: string; amount: number; description: string; createdAt: string }[];
}

export default function CreditsV2() {
  const [data, setData] = useState<PaygStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payg/status")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppShellV2 breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Credits" }]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Credits & Passes</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your PitchIQ credits and period passes</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-neutral-100 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 text-center">
                <Coins size={20} className="text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-neutral-900">{data?.creditBalance ?? 0}</p>
                <p className="text-xs text-neutral-500">Credits Available</p>
              </Card>
              <Card className="p-5 text-center">
                <ArrowUpRight size={20} className="text-primary-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-neutral-900">{data?.lifetimeCredits ?? 0}</p>
                <p className="text-xs text-neutral-500">Lifetime Used</p>
              </Card>
              <Card className="p-5 text-center">
                <Calendar size={20} className="text-emerald-500 mx-auto mb-2" />
                {data?.activePass ? (
                  <>
                    <p className="text-lg font-bold text-emerald-600">{data.activePass.planKey}</p>
                    <p className="text-xs text-neutral-500">Expires {new Date(data.activePass.expiresAt).toLocaleDateString()}</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-neutral-400">None</p>
                    <p className="text-xs text-neutral-500">No active pass</p>
                  </>
                )}
              </Card>
            </div>

            {/* Buy credits */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">Need more credits?</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Credits let you create decks, run scoring, and access premium features</p>
                </div>
                <Link href="/dashboard/credits">
                  <Button>
                    <ShoppingCart size={14} className="mr-1.5" /> Buy Credits
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Transaction history */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-neutral-900 mb-4">Recent Transactions</h2>
              {(!data?.transactions || data.transactions.length === 0) ? (
                <p className="text-xs text-neutral-400 text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {data.transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                      <Badge variant={tx.amount > 0 ? "success" : "warning"} size="sm">
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </Badge>
                      <span className="text-sm text-neutral-700 flex-1">{tx.description}</span>
                      <span className="text-xs text-neutral-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </AppShellV2>
  );
}
