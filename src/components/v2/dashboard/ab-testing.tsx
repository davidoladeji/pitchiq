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
import type { ABTest } from "@/types";

interface ABTestingProps {
  tests: ABTest[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function statusVariant(
  status: string
): "primary" | "success" | "warning" | "default" {
  switch (status) {
    case "active":
      return "primary";
    case "completed":
      return "success";
    case "paused":
      return "warning";
    default:
      return "default";
  }
}

export function ABTesting({ tests }: ABTestingProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>A/B Testing</CardTitle>
        <div className="flex items-center gap-2">
          {tests.length > 0 && (
            <Badge variant={statusVariant(tests[0].status)} size="sm">
              {tests[0].status}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/ab-tests")}>
            Create Test
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {tests.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">
              No active tests. Create one to compare deck variants.
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/ab-tests")}>
              Create Test
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {tests.map((test) => {
              const totalViews =
                test.variantA.views + test.variantB.views || 1;
              const pctA = Math.round(
                (test.variantA.views / totalViews) * 100
              );
              const pctB = 100 - pctA;

              return (
                <div key={test.id}>
                  <p className="mb-3 font-medium text-neutral-900">
                    {test.deckTitle}
                  </p>

                  {/* Variant blocks */}
                  <div className="mb-3 grid grid-cols-2 gap-3">
                    {/* Variant A */}
                    <div className="rounded-lg border border-neutral-100 p-3">
                      <p className="mb-1 text-xs font-medium text-neutral-500">
                        {test.variantA.label}
                      </p>
                      <p className="text-sm text-neutral-900">
                        {test.variantA.views} views
                      </p>
                      <p className="text-xs text-neutral-400">
                        Avg {formatTime(test.variantA.avgTimeSeconds)}
                      </p>
                    </div>

                    {/* Variant B */}
                    <div className="rounded-lg border border-neutral-100 p-3">
                      <p className="mb-1 text-xs font-medium text-neutral-500">
                        {test.variantB.label}
                      </p>
                      <p className="text-sm text-neutral-900">
                        {test.variantB.views} views
                      </p>
                      <p className="text-xs text-neutral-400">
                        Avg {formatTime(test.variantB.avgTimeSeconds)}
                      </p>
                    </div>
                  </div>

                  {/* Comparison bar */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-neutral-500">
                      <span>{pctA}%</span>
                      <span>{pctB}%</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary-400 transition-all duration-500"
                        style={{ width: `${pctA}%` }}
                      />
                      <div
                        className="bg-primary-600 transition-all duration-500"
                        style={{ width: `${pctB}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
