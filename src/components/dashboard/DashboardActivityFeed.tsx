"use client";

import Link from "next/link";

export interface ActivityItem {
  type: "view" | "created" | "scored";
  title: string;
  deckTitle: string;
  time: string; // ISO string
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string; verb: string }> = {
  view: {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    verb: "Someone viewed",
  },
  created: {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    color: "text-electric",
    bgColor: "bg-electric/10",
    verb: "You created",
  },
  scored: {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: "text-green-600",
    bgColor: "bg-green-50",
    verb: "PIQ scored",
  },
};

export default function DashboardActivityFeed({
  activities,
  plan,
}: {
  activities: ActivityItem[];
  plan: string;
}) {
  const isGated = plan === "starter";
  const displayActivities = activities.slice(0, 10);

  // Placeholder data for gated view
  const placeholderActivities: ActivityItem[] = [
    { type: "view", title: "Someone viewed your deck", deckTitle: "Sample Deck", time: new Date().toISOString() },
    { type: "created", title: "You created a new deck", deckTitle: "Demo Deck", time: new Date(Date.now() - 3600000).toISOString() },
    { type: "scored", title: "PIQ scored your deck", deckTitle: "Another Deck", time: new Date(Date.now() - 7200000).toISOString() },
    { type: "view", title: "Someone viewed your deck", deckTitle: "Sample Deck", time: new Date(Date.now() - 14400000).toISOString() },
  ];

  const items = isGated ? placeholderActivities : displayActivities;

  return (
    <section aria-label="Recent activity" className="bg-white rounded-2xl border border-navy-200 p-4 sm:p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-navy font-display">Recent Activity</h3>
        {!isGated && (
          <span className="text-[10px] text-navy-500 uppercase tracking-wider">
            Pro+
          </span>
        )}
      </div>

      <div className={isGated ? "blur-[5px] select-none pointer-events-none" : ""}>
        {items.length === 0 ? (
          <p className="text-sm text-navy-500 text-center py-6">No recent activity yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => {
              const config = typeConfig[item.type] || typeConfig.view;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0 mt-0.5 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-navy">
                      <span className="font-medium">{config.verb}</span>{" "}
                      <span className="text-navy-500">{item.deckTitle}</span>
                    </p>
                    <p className="text-[10px] text-navy-500 mt-0.5 tabular-nums">
                      {relativeTime(item.time)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gated overlay for starter plan */}
      {isGated && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
          <div className="text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-navy mb-1">Activity Feed</p>
            <p className="text-xs text-navy-500 mb-3 max-w-[200px] mx-auto">
              Upgrade to Pro to see who is viewing your decks.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-electric text-white text-xs font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Upgrade to Pro for activity feed"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
