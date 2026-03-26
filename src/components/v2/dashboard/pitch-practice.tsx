"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/v2/ui/card";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import type { PracticeSession } from "@/types";

interface PitchPracticeProps {
  sessions: PracticeSession[];
}

function formatDuration(seconds: number): string {
  return `${Math.round(seconds / 60)}m`;
}

function scoreVariant(score: number): "success" | "warning" | "error" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PitchPractice({ sessions }: PitchPracticeProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Pitch Practice</CardTitle>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/practice")}>
          Start Practice &rarr;
        </Button>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-neutral-100">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-neutral-900">
                  {session.deckTitle}
                </p>
                <p className="text-xs text-neutral-400">
                  {formatDate(session.date)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span className="text-xs text-neutral-500">
                  {formatDuration(session.durationSeconds)}
                </span>
                <Badge variant={scoreVariant(session.overallScore)} size="sm">
                  {session.overallScore}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
