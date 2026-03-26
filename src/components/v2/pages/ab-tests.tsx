"use client";

import { motion } from "framer-motion";
import { Plus, FlaskConical } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/v2/ui/card";
import { EmptyState } from "@/components/v2/ui/empty-state";
import { mockABTests } from "@/lib/mock-data";
import { staggerContainer, fadeInUp } from "@/lib/animations";

function statusVariant(status: string) {
  if (status === "running") return "primary" as const;
  if (status === "completed") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "default" as const;
}

export default function ABTestsPage() {
  if (mockABTests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">A/B Tests</h1>
          <Button variant="default">
            <Plus className="h-4 w-4" />
            Create Test
          </Button>
        </div>
        <EmptyState
          icon={FlaskConical}
          title="No A/B tests yet"
          description="Compare two deck variants to see which performs better."
          actionLabel="Create Test"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">A/B Tests</h1>
        <Button variant="default">
          <Plus className="h-4 w-4" />
          Create Test
        </Button>
      </motion.div>

      {/* Test cards */}
      {mockABTests.map((test) => {
        const totalViews = test.variantA.views + test.variantB.views;
        const pctA = totalViews > 0 ? (test.variantA.views / totalViews) * 100 : 50;
        const pctB = totalViews > 0 ? (test.variantB.views / totalViews) * 100 : 50;
        const leader =
          test.variantB.views > test.variantA.views * 1.05
            ? "Variant B leading"
            : test.variantA.views > test.variantB.views * 1.05
              ? "Variant A leading"
              : null;

        return (
          <motion.div key={test.id} variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle>{test.deckTitle}</CardTitle>
                  <Badge variant={statusVariant(test.status)}>{test.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Two variant blocks */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Variant A */}
                  <div className="rounded-lg border p-4 bg-surface-page">
                    <p className="text-xs font-semibold uppercase text-primary-600">
                      Variant A
                    </p>
                    <p className="mt-1 text-sm font-medium">{test.variantA.label}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                      <span>{test.variantA.views} views</span>
                      <span>{test.variantA.avgTimeSeconds}s avg</span>
                    </div>
                  </div>

                  {/* Variant B */}
                  <div className="rounded-lg border p-4 bg-surface-page">
                    <p className="text-xs font-semibold uppercase text-primary-600">
                      Variant B
                    </p>
                    <p className="mt-1 text-sm font-medium">{test.variantB.label}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                      <span>{test.variantB.views} views</span>
                      <span>{test.variantB.avgTimeSeconds}s avg</span>
                    </div>
                  </div>
                </div>

                {/* Comparison bar */}
                <div className="h-3 flex rounded-full overflow-hidden">
                  <div
                    className="bg-primary-400"
                    style={{ width: `${pctA}%` }}
                  />
                  <div
                    className="bg-primary-600"
                    style={{ width: `${pctB}%` }}
                  />
                </div>

                {/* Labels below bar */}
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>A: {Math.round(pctA)}%</span>
                  <span>B: {Math.round(pctB)}%</span>
                </div>

                {/* Winner indicator */}
                {leader && (
                  <p className="text-sm font-medium text-primary-600">{leader}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
