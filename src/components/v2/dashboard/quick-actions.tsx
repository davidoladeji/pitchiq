"use client";

import { useRouter } from "next/navigation";
import { Plus, Upload, Lightbulb, Building2, BookOpen } from "lucide-react";
import { Button } from "@/components/v2/ui/button";

const actions = [
  { label: "New Deck", icon: Plus, variant: "default" as const, route: "/create" },
  { label: "Upload & Score", icon: Upload, variant: "outline" as const, route: "/score" },
  { label: "Explore Ideas", icon: Lightbulb, variant: "outline" as const, route: "/ideas" },
  { label: "Startup Profile", icon: Building2, variant: "outline" as const, route: "/dashboard/startup-profile" },
  { label: "PIQ Score Guide", icon: BookOpen, variant: "outline" as const, route: "/piq-score" },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="default"
          onClick={() => router.push(action.route)}
        >
          <action.icon className="mr-1.5 h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
