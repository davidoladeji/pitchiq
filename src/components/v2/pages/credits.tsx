"use client";

import { Coins, Clock, ArrowUpRight } from "lucide-react";

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

/* ────────────────────── Mock data ────────────────────────── */

interface Transaction {
  id: number;
  date: string;
  type: "purchase" | "usage" | "bonus";
  amount: number;
  balanceAfter: number;
  description: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 1, date: "Mar 22, 2026", type: "purchase", amount: 27, balanceAfter: 50, description: "Bought 25 Credits (+2 bonus)" },
  { id: 2, date: "Mar 22, 2026", type: "usage", amount: -3, balanceAfter: 23, description: "Investor Matching — Series A Pitch" },
  { id: 3, date: "Mar 21, 2026", type: "usage", amount: -1, balanceAfter: 26, description: "AI Slide Coaching" },
  { id: 4, date: "Mar 21, 2026", type: "usage", amount: -2, balanceAfter: 27, description: "Export to PDF — Seed Round" },
  { id: 5, date: "Mar 20, 2026", type: "usage", amount: -5, balanceAfter: 29, description: "Created deck: Growth Strategy" },
  { id: 6, date: "Mar 19, 2026", type: "usage", amount: -3, balanceAfter: 34, description: "Investor Matching — Demo Deck" },
  { id: 7, date: "Mar 18, 2026", type: "bonus", amount: 5, balanceAfter: 37, description: "Welcome bonus credits" },
  { id: 8, date: "Mar 15, 2026", type: "purchase", amount: 32, balanceAfter: 32, description: "Bought 25 Credits (+2 bonus) + 5 Pack Bonus" },
];

const TYPE_BADGE: Record<Transaction["type"], "success" | "warning" | "primary"> = {
  purchase: "success",
  usage: "warning",
  bonus: "primary",
};

/* ═══════════════════════ Credits Page ═══════════════════════ */

export default function CreditsPage() {
  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">
            Credits &amp; Passes
          </h1>
          <span className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1 text-lg font-bold text-primary-700">
            <Coins size={18} />
            23
          </span>
        </div>
        <Button>
          <Coins size={16} />
          Buy Credits
        </Button>
      </div>

      {/* ── Section 1: Credit Balance ───────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-4xl font-bold text-neutral-900">23</p>
              <p className="mt-1 text-sm text-neutral-500">
                Lifetime earned: 85 credits
              </p>
            </div>
            <Button>Buy More</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Active Passes ────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Active Passes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active pass */}
          <div className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50/50 p-4">
            <div className="flex items-center gap-3">
              <Badge variant="primary" size="lg">Growth Pass</Badge>
              <div>
                <p className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-primary-500" />
                  5 days remaining
                </p>
                <p className="text-xs text-neutral-500">
                  Expires Mar 27, 2026
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Extend
              <ArrowUpRight size={14} />
            </Button>
          </div>

          {/* Expired pass */}
          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 opacity-70">
            <div className="flex items-center gap-3">
              <Badge variant="outline" size="lg">Expired</Badge>
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Basic Pass
                </p>
                <p className="text-xs text-neutral-400">
                  Mar 1 &ndash; Mar 8, 2026
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Transaction History ───────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRANSACTIONS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap text-neutral-600">
                    {tx.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant={TYPE_BADGE[tx.type]} size="sm">
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono font-medium ${
                      tx.amount > 0 ? "text-success-600" : "text-neutral-700"
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </TableCell>
                  <TableCell className="text-right font-mono text-neutral-600">
                    {tx.balanceAfter}
                  </TableCell>
                  <TableCell className="text-neutral-600">
                    {tx.description}
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
