"use client";

import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/v2/ui/card";
import { Sparkline } from "@/components/v2/dashboard/sparkline";
import { formatPercent } from "@/lib/cn";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  prefix?: string;
  sparklineData?: number[];
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  prefix,
  sparklineData,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card hover className="p-5">
        {/* Top row: icon + trend badge */}
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
            <Icon className="h-5 w-5 text-primary-600" />
          </div>

          {change !== undefined && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                isPositive
                  ? "bg-success-50 text-success-700"
                  : "bg-error-50 text-error-700"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatPercent(change)}
            </span>
          )}
        </div>

        {/* Value */}
        <p className="mt-3 text-2xl font-bold text-neutral-900 font-mono tabular-nums">
          {prefix}
          {value}
        </p>

        {/* Title */}
        <p className="mt-1 text-sm font-medium text-neutral-500">{title}</p>

        {/* Sparkline */}
        {sparklineData && sparklineData.length >= 2 && (
          <div className="mt-3 flex items-center gap-2">
            <Sparkline data={sparklineData} width={100} height={28} />
            <span className="text-[10px] font-medium text-neutral-400">
              30d trend
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
