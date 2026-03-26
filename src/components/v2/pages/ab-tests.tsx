"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, FlaskConical } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card } from "@/components/v2/ui/card";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";
import type { ABTest } from "@/types";

export default function ABTestsPage() {
  const router = useRouter();
  const { data: dashData, loading } = useDashboardData();
  const tests = (dashData?.abTests || []) as ABTest[];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: "var(--void-surface)" }} />
        <div className="h-40 rounded-xl animate-pulse" style={{ background: "var(--void-surface)" }} />
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--void-text)" }}>A/B Tests</h2>
          <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>{tests.length} test{tests.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => router.push("/dashboard/ab-tests")}><Plus size={16} className="mr-2" /> New Test</Button>
      </motion.div>

      {tests.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <Card className="text-center py-12">
            <FlaskConical size={32} className="mx-auto mb-3" style={{ color: "var(--void-text-dim)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>No A/B tests yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--void-text-dim)" }}>Test different deck variants to see which performs better</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/ab-tests")}>Create Your First Test</Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} className="space-y-3">
          {tests.map((t) => (
            <Card key={t.id} className="p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>{t.deckTitle}</p>
                  <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>Started {relativeTime(t.startedAt)}</p>
                </div>
                <Badge variant={t.status === "active" ? "success" : "default"}>{t.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 text-center" style={{ background: "var(--void-surface)", border: "1px solid var(--void-border)" }}>
                  <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>Variant A</p>
                  <p className="text-lg font-semibold" style={{ color: "var(--void-text)" }}>{t.variantA.views} views</p>
                  <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>{t.variantA.avgTimeSeconds}s avg</p>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: "var(--void-surface)", border: "1px solid var(--void-border)" }}>
                  <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>Variant B</p>
                  <p className="text-lg font-semibold" style={{ color: "var(--void-text)" }}>{t.variantB.views} views</p>
                  <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>{t.variantB.avgTimeSeconds}s avg</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
