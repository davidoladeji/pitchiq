"use client";

import { Eye, Plus, BarChart3, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/v2/ui/card";
import { relativeTime } from "@/lib/cn";

export interface ActivityItem {
  id: string;
  type: "view" | "create" | "score";
  message: string;
  timestamp: string;
  deckId?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const iconMap: Record<ActivityItem["type"], { icon: LucideIcon; color: string }> = {
  view: { icon: Eye, color: "text-primary-500" },
  create: { icon: Plus, color: "text-success-500" },
  score: { icon: BarChart3, color: "text-warning-500" },
};

const listItem = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" as const },
  }),
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto pr-1">
          {activities.map((activity, i) => {
            const { icon: Icon, color } = iconMap[activity.type];

            return (
              <motion.div
                key={activity.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={listItem}
                className={`flex gap-3 py-3 ${
                  i < activities.length - 1
                    ? "border-b border-neutral-100"
                    : ""
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-700">{activity.message}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {relativeTime(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
