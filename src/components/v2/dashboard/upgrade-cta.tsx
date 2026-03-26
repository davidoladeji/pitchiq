"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/v2/ui/card";
import { Button } from "@/components/v2/ui/button";

export function UpgradeCta() {
  const router = useRouter();

  return (
    <Card gradient className="p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Unlock Full Potential
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Upgrade to access investor matching, analytics, A/B testing, and
            more.
          </p>
        </div>
        <Button variant="default" className="flex-shrink-0" onClick={() => router.push("/billing")}>
          Upgrade Plan
        </Button>
      </div>
    </Card>
  );
}
