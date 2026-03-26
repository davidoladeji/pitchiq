"use client";

import { motion } from "framer-motion";
import { Mic, Star, Trophy } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardContent } from "@/components/v2/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/v2/ui/table";
import { EmptyState } from "@/components/v2/ui/empty-state";
import { MetricCard } from "@/components/v2/dashboard/metric-card";
import { mockPractice } from "@/lib/mock-data";
import { staggerContainer, fadeInUp } from "@/lib/animations";

function scoreBadgeVariant(score: number) {
  if (score >= 80) return "success" as const;
  if (score >= 60) return "warning" as const;
  return "error" as const;
}

const avgScore =
  mockPractice.length > 0
    ? Math.round(
        mockPractice.reduce((sum, s) => sum + s.overallScore, 0) /
          mockPractice.length,
      )
    : 0;

const bestScore =
  mockPractice.length > 0
    ? Math.max(...mockPractice.map((s) => s.overallScore))
    : 0;

export default function PracticePage() {
  if (mockPractice.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Pitch Practice</h1>
          <Button variant="default">
            <Mic className="h-4 w-4" />
            Start New Session
          </Button>
        </div>
        <EmptyState
          icon={Mic}
          title="No practice sessions yet"
          description="Record your first pitch to get AI feedback."
          actionLabel="Start Practice"
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
        <h1 className="text-2xl font-bold text-neutral-900">Pitch Practice</h1>
        <Button variant="default">
          <Mic className="h-4 w-4" />
          Start New Session
        </Button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <MetricCard
          title="Total Sessions"
          value={mockPractice.length}
          icon={Mic}
        />
        <MetricCard title="Avg Score" value={avgScore} icon={Star} />
        <MetricCard title="Best Score" value={bestScore} icon={Trophy} />
      </motion.div>

      {/* Sessions table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deck</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Clarity</TableHead>
                  <TableHead>Pacing</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPractice.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.deckTitle}
                    </TableCell>
                    <TableCell>
                      {new Date(session.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {Math.round(session.durationSeconds / 60)}min
                    </TableCell>
                    <TableCell>
                      <Badge variant={scoreBadgeVariant(session.overallScore)}>
                        {session.overallScore}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={scoreBadgeVariant(session.clarity)}>
                        {session.clarity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={scoreBadgeVariant(session.pacing)}>
                        {session.pacing}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={scoreBadgeVariant(session.confidence)}>
                        {session.confidence}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
