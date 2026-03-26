"use client";

import { useRouter } from "next/navigation";
import { Mic, Clock, BarChart3 } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Card } from "@/components/v2/ui/card";
import { Button } from "@/components/v2/ui/button";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";

interface PracticeSession {
  id: string;
  deckId: string;
  deckTitle: string;
  date: string;
  durationSeconds: number;
  overallScore: number;
  clarity: number;
  pacing: number;
  confidence: number;
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch { return dateStr; }
}

export default function PracticePage() {
  const router = useRouter();
  const { data: dashData, loading } = useDashboardData();
  const sessions = (dashData?.practice || []) as PracticeSession[];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: "var(--void-surface)" }} />
        {[1, 2].map((i) => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--void-surface)" }} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--void-text)" }}>Pitch Practice</h2>
          <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>{sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded</p>
        </div>
        <Button onClick={() => router.push("/dashboard/practice")}>
          <Mic size={16} className="mr-2" /> New Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-12">
          <Mic size={32} className="mx-auto mb-3" style={{ color: "var(--void-text-dim)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>No practice sessions yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--void-text-dim)" }}>Pick a deck and practice your pitch with AI feedback</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/practice")}>
            Start Practicing
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{
                  background: s.overallScore >= 80 ? "var(--neon-emerald)" : s.overallScore >= 60 ? "var(--neon-electric)" : "#FBBF24",
                  boxShadow: `0 0 12px ${s.overallScore >= 80 ? "rgba(0,255,157,0.3)" : s.overallScore >= 60 ? "rgba(67,97,238,0.3)" : "rgba(251,191,36,0.3)"}`,
                }}>
                  {s.overallScore}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>{s.deckTitle}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--void-text-dim)" }}>
                    <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(s.date)}</span>
                    <span className="flex items-center gap-1"><BarChart3 size={12} /> {Math.round(s.durationSeconds / 60)}min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.clarity >= 70 ? "success" : "warning"}>Clarity {s.clarity}</Badge>
                  <Badge variant={s.pacing >= 70 ? "success" : "warning"}>Pacing {s.pacing}</Badge>
                  <Badge variant={s.confidence >= 70 ? "success" : "warning"}>Confidence {s.confidence}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
