"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/v2/ui/card";
import { Badge } from "@/components/v2/ui/badge";
import type { FundraisePipeline } from "@/types";

interface FundraisePipelineProps {
  pipeline: FundraisePipeline;
}

const stages: {
  key: keyof FundraisePipeline;
  label: string;
  color: string;
}[] = [
  { key: "identified", label: "Identified", color: "bg-primary-300" },
  { key: "contacted", label: "Contacted", color: "bg-primary-400" },
  { key: "meeting", label: "Meeting", color: "bg-primary-500" },
  { key: "dueDiligence", label: "Due Diligence", color: "bg-primary-600" },
  { key: "termSheet", label: "Term Sheet", color: "bg-primary-700" },
];

export function FundraisePipelineCard({ pipeline }: FundraisePipelineProps) {
  const router = useRouter();
  const maxCount = Math.max(
    ...stages.map((s) => pipeline[s.key]),
    1
  );
  const total = stages.reduce((sum, s) => sum + pipeline[s.key], 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Fundraise Pipeline</CardTitle>
        <button
          onClick={() => router.push("/dashboard/fundraise")}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Open Tracker &rarr;
        </button>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {stages.map((stage) => {
            const count = pipeline[stage.key];
            const widthPct = (count / maxCount) * 100;

            return (
              <div key={stage.key} className="flex items-center gap-3">
                <span className="w-28 flex-shrink-0 text-sm text-neutral-600">
                  {stage.label}
                </span>
                <Badge size="sm" variant="default" className="w-8 justify-center">
                  {count}
                </Badge>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
          Total contacts:{" "}
          <span className="font-semibold text-neutral-900">{total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
