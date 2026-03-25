"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Eye, Plus, Target, Users, Clock } from "lucide-react";
import { Tabs } from "../ui/Tabs";

interface Activity {
  type: "view" | "created" | "scored";
  title: string;
  deckTitle: string;
  time: string;
}

interface ActivityPanelProps {
  activities: Activity[];
  totalViews?: number;
  className?: string;
}

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  view: { icon: Eye, color: "text-navy-400 dark:text-white/40" },
  created: { icon: Plus, color: "text-electric" },
  scored: { icon: Target, color: "text-violet" },
  investor: { icon: Users, color: "text-emerald" },
};

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return dateStr;
  }
}

/**
 * Activity panel with Analytics + Activity Feed tabs.
 * Phase 2.4 of the dashboard redesign.
 */
export function ActivityPanel({ activities, className }: ActivityPanelProps) {
  const [activeTab, setActiveTab] = useState("activity");

  const tabs = [
    { id: "activity", label: "Activity" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className={cn("bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] overflow-hidden", className)}>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="px-4" />

      <div className="p-4">
        {activeTab === "activity" && (
          <div className="space-y-0.5">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-navy-300 dark:text-white/20 mx-auto mb-2" />
                <p className="text-sm text-navy-400 dark:text-white/40">
                  Activity will appear here as you create and share decks
                </p>
              </div>
            ) : (
              activities.slice(0, 10).map((activity, i) => {
                const meta = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.view;
                const Icon = meta.icon;
                return (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
                    <div className={cn("mt-0.5", meta.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy dark:text-white truncate">{activity.title}</p>
                      <p className="text-xs text-navy-400 dark:text-white/40">{activity.deckTitle}</p>
                    </div>
                    <span className="text-xs text-navy-400 dark:text-white/30 shrink-0">
                      {timeAgo(activity.time)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="text-center py-8">
            <div className="w-full h-32 bg-[var(--surface-2)] rounded-xl mb-4 flex items-center justify-center">
              <p className="text-xs text-navy-400 dark:text-white/30">Views chart coming soon</p>
            </div>
            <p className="text-sm text-navy-400 dark:text-white/40">
              Share your deck to start seeing analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
