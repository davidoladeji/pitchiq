"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Card } from "@/components/v2/ui/card";
import { Button } from "@/components/v2/ui/button";
import { ProgressRing } from "@/components/v2/ui/progress-ring";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";
import type { PracticeSession } from "@/types";

export default function PracticePage() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then((r) => r.json())
      .then((d) => { setSessions(d.practice || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="section-gap">
        <div className="h-8 w-48 bg-surface-muted rounded-lg animate-pulse" />
        {[1, 2].map((i) => <div key={i} className="h-32 bg-surface-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="section-gap">
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Pitch Practice</h2>
          <p className="text-sm text-neutral-500 mt-1">{sessions.length} sessions recorded</p>
        </div>
        <Button><Mic size={16} className="mr-2" /> New Session</Button>
      </motion.div>

      {sessions.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <Card className="text-center py-12">
            <Mic size={32} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-700">No practice sessions yet</p>
            <p className="text-xs text-neutral-500 mt-1">Pick a deck and practice your pitch with AI feedback</p>
            <Button className="mt-4">Start Practicing</Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="p-4 flex items-center gap-4 hover-lift">
              <ProgressRing score={s.overallScore} size={48} strokeWidth={4} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{s.deckTitle}</p>
                <p className="text-xs text-neutral-500">{relativeTime(s.date)} · {Math.round(s.durationSeconds / 60)}min</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.clarity >= 70 ? "success" : "warning"}>Clarity {s.clarity}</Badge>
                <Badge variant={s.pacing >= 70 ? "success" : "warning"}>Pacing {s.pacing}</Badge>
                <Badge variant={s.confidence >= 70 ? "success" : "warning"}>Confidence {s.confidence}</Badge>
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
