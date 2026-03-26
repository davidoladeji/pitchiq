"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardContent } from "@/components/v2/ui/card";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";
import type { FundraisePipeline, InvestorContact } from "@/types";

const STAGES = [
  { key: "identified", label: "Identified", color: "var(--void-text-dim)" },
  { key: "contacted", label: "Contacted", color: "#FBBF24" },
  { key: "meeting", label: "Meeting", color: "var(--neon-electric)" },
  { key: "dueDiligence", label: "Due Diligence", color: "var(--neon-cyan)" },
  { key: "termSheet", label: "Term Sheet", color: "var(--neon-emerald)" },
];

export default function FundraisePage() {
  const router = useRouter();
  const { data: dashData } = useDashboardData();
  const pipeline = (dashData?.fundraise || { identified: 0, contacted: 0, meeting: 0, dueDiligence: 0, termSheet: 0 }) as FundraisePipeline;
  const contacts = (dashData?.investorContacts || []) as InvestorContact[];

  const total = Object.values(pipeline).reduce((s, v) => s + v, 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--void-text)" }}>Fundraise Pipeline</h2>
          <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>{total} investor{total !== 1 ? "s" : ""} in pipeline</p>
        </div>
        <Button onClick={() => router.push("/dashboard/investors")}><Plus size={16} className="mr-2" /> Add Investor</Button>
      </motion.div>

      {/* Pipeline bars */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {STAGES.map((s) => {
                const count = pipeline[s.key as keyof FundraisePipeline] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-xs w-28" style={{ color: "var(--void-text-muted)" }}>{s.label}</span>
                    <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: "var(--void-surface)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%`, background: s.color }} />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right" style={{ color: "var(--void-text)" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent contacts */}
      <motion.div variants={fadeInUp}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--void-text)" }}>Recent Contacts</h3>
        {contacts.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm" style={{ color: "var(--void-text-dim)" }}>No contacts yet. Add investors to track your pipeline.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {contacts.slice(0, 10).map((c) => (
              <Card key={c.id} className="p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(67,97,238,0.15)", color: "var(--neon-cyan)" }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--void-text)" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>{c.firm}</p>
                </div>
                <Badge variant={c.stage === "meeting" ? "success" : c.stage === "contacted" ? "warning" : "default"}>{c.stage}</Badge>
                <span className="text-xs" style={{ color: "var(--void-text-dim)" }}>{relativeTime(c.lastUpdated)}</span>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
