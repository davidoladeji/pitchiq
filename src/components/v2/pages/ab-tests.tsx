"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, FlaskConical } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card } from "@/components/v2/ui/card";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";
import type { ABTest } from "@/types";

export default function ABTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then((r) => r.json())
      .then((d) => { setTests(d.abTests || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="section-gap">
        <div className="h-8 w-48 bg-surface-muted rounded-lg animate-pulse" />
        <div className="h-40 bg-surface-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="section-gap">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">A/B Tests</h2>
          <p className="text-sm text-neutral-500 mt-1">{tests.length} test{tests.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => router.push("/dashboard/ab-tests")}><Plus size={16} className="mr-2" /> New Test</Button>
      </motion.div>

      {tests.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <Card className="text-center py-12">
            <FlaskConical size={32} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-700">No A/B tests yet</p>
            <p className="text-xs text-neutral-500 mt-1">Test different deck variants to see which performs better</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/ab-tests")}>Create Your First Test</Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} className="space-y-3">
          {tests.map((t) => (
            <Card key={t.id} className="p-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t.deckTitle}</p>
                  <p className="text-xs text-neutral-500">Started {relativeTime(t.startedAt)}</p>
                </div>
                <Badge variant={t.status === "active" ? "success" : "default"}>{t.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface-muted p-3 text-center">
                  <p className="text-xs text-neutral-500">Variant A</p>
                  <p className="text-lg font-semibold text-neutral-900">{t.variantA.views} views</p>
                  <p className="text-xs text-neutral-400">{t.variantA.avgTimeSeconds}s avg</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-3 text-center">
                  <p className="text-xs text-neutral-500">Variant B</p>
                  <p className="text-lg font-semibold text-neutral-900">{t.variantB.views} views</p>
                  <p className="text-xs text-neutral-400">{t.variantB.avgTimeSeconds}s avg</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
