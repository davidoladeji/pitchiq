"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/v2/ui/card";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useToast } from "@/components/v2/ui/toast";
import type { InvestorMatch } from "@/types";

interface InvestorMatchesProps {
  investors: InvestorMatch[];
}

const typeBadgeVariant: Record<string, "primary" | "success" | "warning"> = {
  vc: "primary",
  accelerator: "success",
  angel: "warning",
};

function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-primary-500";
  if (score >= 60) return "bg-warning-500";
  return "bg-error-500";
}

export function InvestorMatches({ investors }: InvestorMatchesProps) {
  const { addToast } = useToast();
  const displayed = investors.slice(0, 3);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Top Investor Matches
        </h2>
        <Link
          href="/dashboard/investors"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View All Matches &rarr;
        </Link>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {displayed.map((investor) => (
          <motion.div key={investor.id} variants={fadeInUp}>
            <Card hover className="p-5">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-neutral-900">
                  {investor.name}
                </span>
                <Badge
                  variant={typeBadgeVariant[investor.type] ?? "default"}
                  size="sm"
                >
                  {investor.type}
                </Badge>
              </div>

              {/* Fit score */}
              <div className="mb-3">
                <div className="mb-1 flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold text-neutral-900">
                    {investor.fitScore}
                  </span>
                  <span className="text-sm text-neutral-500">%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(investor.fitScore)}`}
                    style={{ width: `${investor.fitScore}%` }}
                  />
                </div>
              </div>

              {/* Match reasons */}
              <ul className="space-y-1">
                {investor.matchReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-success-500" />
                    <span className="text-xs text-neutral-600">{reason}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => addToast({ type: "success", title: "Saved to Pipeline", description: `${investor.name} added to your fundraise pipeline.` })}
              >
                Save to Pipeline
              </Button>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
