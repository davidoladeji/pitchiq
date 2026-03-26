"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardContent } from "@/components/v2/ui/card";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";
import type { FundraisePipeline, InvestorContact } from "@/types";

const STAGES = [
  { key: "identified", label: "Identified", color: "bg-neutral-200" },
  { key: "contacted", label: "Contacted", color: "bg-warning-300" },
  { key: "meeting", label: "Meeting", color: "bg-primary-400" },
  { key: "dueDiligence", label: "Due Diligence", color: "bg-primary-600" },
  { key: "termSheet", label: "Term Sheet", color: "bg-success-500" },
];

export default function FundraisePage() {
  const router = useRouter();
  const [pipeline, setPipeline] = useState<FundraisePipeline>({ identified: 0, contacted: 0, meeting: 0, dueDiligence: 0, termSheet: 0 });
  const [contacts, setContacts] = useState<InvestorContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setPipeline(d.fundraise || { identified: 0, contacted: 0, meeting: 0, dueDiligence: 0, termSheet: 0 });
        setContacts(d.investorContacts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = Object.values(pipeline).reduce((s, v) => s + v, 0);

  if (loading) {
    return (
      <div className="section-gap">
        <div className="h-8 w-48 bg-surface-muted rounded-lg animate-pulse" />
        <div className="h-24 bg-surface-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="section-gap">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Fundraise Pipeline</h2>
          <p className="text-sm text-neutral-500 mt-1">{total} investor{total !== 1 ? "s" : ""} in pipeline</p>
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
                    <span className="text-xs text-neutral-600 w-28">{s.label}</span>
                    <div className="flex-1 h-6 bg-surface-muted rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent contacts */}
      <motion.div variants={fadeInUp}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">Recent Contacts</h3>
        {contacts.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-neutral-500">No contacts yet. Add investors to track your pipeline.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {contacts.slice(0, 10).map((c) => (
              <Card key={c.id} className="p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-xs font-semibold text-primary-600">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{c.name}</p>
                  <p className="text-xs text-neutral-500">{c.firm}</p>
                </div>
                <Badge variant={c.stage === "meeting" ? "success" : c.stage === "contacted" ? "warning" : "default"}>{c.stage}</Badge>
                <span className="text-xs text-neutral-400">{relativeTime(c.lastUpdated)}</span>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
