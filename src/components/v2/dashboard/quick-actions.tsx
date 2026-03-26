"use client";

import { Plus, Upload, Lightbulb, Building2, BookOpen } from "lucide-react";
import { Button } from "@/components/v2/ui/button";
import { useToast } from "@/components/v2/ui/toast";

const actions = [
  { label: "New Deck", icon: Plus, variant: "default" as const, toast: { type: "info" as const, title: "Create New Deck", description: "Opening deck creation wizard..." } },
  { label: "Upload & Score", icon: Upload, variant: "outline" as const, toast: { type: "info" as const, title: "Upload & Score", description: "Opening file upload dialog..." } },
  { label: "Explore Ideas", icon: Lightbulb, variant: "outline" as const, toast: { type: "info" as const, title: "Explore Ideas", description: "Launching idea generator..." } },
  { label: "Startup Profile", icon: Building2, variant: "outline" as const, toast: { type: "success" as const, title: "Startup Profile", description: "You have 1 profile configured." } },
  { label: "PIQ Score Guide", icon: BookOpen, variant: "outline" as const, toast: { type: "info" as const, title: "PIQ Score Guide", description: "Opening scoring methodology..." } },
];

export function QuickActions() {
  const { addToast } = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="default"
          onClick={() => addToast(action.toast)}
        >
          <action.icon className="mr-1.5 h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
