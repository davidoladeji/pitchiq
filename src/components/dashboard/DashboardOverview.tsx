"use client";

import Link from "next/link";

interface DeckSummary {
  id: string;
  shareId: string;
  title: string;
  piqScore: string;
  viewCount: number;
}

function parsePiqOverall(piqJson: string): number | null {
  try {
    const parsed = JSON.parse(piqJson);
    return typeof parsed.overall === "number" ? parsed.overall : null;
  } catch {
    return null;
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-electric";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export default function DashboardOverview({
  decks,
  totalViews,
  plan,
}: {
  decks: DeckSummary[];
  totalViews: number;
  plan: string;
}) {
  const scores = decks
    .map((d) => parsePiqOverall(d.piqScore))
    .filter((s): s is number => s !== null);

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const bestDeck = decks.reduce<{ shareId: string; title: string; score: number } | null>(
    (best, d) => {
      const s = parsePiqOverall(d.piqScore);
      if (s !== null && (best === null || s > best.score)) {
        return { shareId: d.shareId, title: d.title, score: s };
      }
      return best;
    },
    null
  );

  const planBadgeColor =
    plan === "enterprise"
      ? "bg-navy-900 text-white"
      : plan === "growth"
        ? "bg-violet-100 text-violet-700"
        : plan === "pro"
          ? "bg-electric/10 text-electric"
          : "bg-navy-100 text-navy-600";

  const stats = [
    {
      label: "Total Decks",
      value: decks.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: "text-electric",
      bgColor: "bg-electric/10",
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "text-violet-600",
      bgColor: "bg-violet-100",
    },
    {
      label: "Avg PIQ Score",
      value: avgScore !== null ? avgScore : "--",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      color: avgScore !== null ? scoreColor(avgScore) : "text-navy-400",
      bgColor: avgScore !== null && avgScore >= 60 ? "bg-green-50" : "bg-orange-50",
    },
    {
      label: "Best Deck",
      value: bestDeck ? bestDeck.score : "--",
      subtitle: bestDeck?.title,
      link: bestDeck ? `/deck/${bestDeck.shareId}` : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
      color: bestDeck ? scoreColor(bestDeck.score) : "text-navy-400",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <section aria-label="Dashboard overview">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-navy font-display">Overview</h2>
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${planBadgeColor}`}>
          {plan}
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const content = (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-navy-200 p-4 sm:p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold tabular-nums text-navy">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-navy-500 mt-0.5">{stat.label}</div>
              {stat.subtitle && (
                <div className="text-xs text-navy-500 mt-1 truncate" title={stat.subtitle}>
                  {stat.subtitle}
                </div>
              )}
            </div>
          );

          if (stat.link) {
            return (
              <Link key={stat.label} href={stat.link} className="block">
                {content}
              </Link>
            );
          }
          return <div key={stat.label}>{content}</div>;
        })}
      </div>
    </section>
  );
}
