import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMatchingAnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const [
    totalEvents,
    actionBreakdown,
    topMatched,
    topDismissed,
    avgScoreResult,
    scoreDistribution,
    recentEvents,
    usersWithoutProfile,
    staleInvestors,
  ] = await Promise.all([
    prisma.matchEvent.count(),
    prisma.matchEvent.groupBy({
      by: ["action"],
      _count: { id: true },
    }),
    prisma.matchEvent.groupBy({
      by: ["investorProfileId"],
      where: { action: "saved" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    prisma.matchEvent.groupBy({
      by: ["investorProfileId"],
      where: { action: "dismissed" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.matchEvent.aggregate({ _avg: { fitScore: true } }),
    Promise.all([
      prisma.matchEvent.count({ where: { fitScore: { gte: 80 } } }),
      prisma.matchEvent.count({ where: { fitScore: { gte: 65, lt: 80 } } }),
      prisma.matchEvent.count({ where: { fitScore: { gte: 50, lt: 65 } } }),
      prisma.matchEvent.count({ where: { fitScore: { gte: 35, lt: 50 } } }),
      prisma.matchEvent.count({ where: { fitScore: { lt: 35 } } }),
    ]),
    prisma.matchEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        fitScore: true,
        createdAt: true,
        investorProfile: { select: { name: true } },
      },
    }),
    prisma.user.count({
      where: { startupProfile: null, plan: { not: "starter" } },
    }),
    prisma.investorProfile.count({
      where: {
        lastActiveDate: { lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  // Resolve investor names for top matched/dismissed
  const investorIds = [
    ...topMatched.map((t) => t.investorProfileId),
    ...topDismissed.map((t) => t.investorProfileId),
  ];
  const investors = investorIds.length > 0
    ? await prisma.investorProfile.findMany({
        where: { id: { in: investorIds } },
        select: { id: true, name: true },
      })
    : [];
  const investorMap = new Map(investors.map((i) => [i.id, i.name]));

  const actionMap = new Map(actionBreakdown.map((a) => [a.action, a._count.id]));
  const avgScore = avgScoreResult._avg.fitScore ?? 0;
  const [excellent, strong, moderate, weak, poor] = scoreDistribution;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Matching Analytics</h1>
        <p className="text-sm text-white/30 mt-1">
          Investor matching performance & insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Match Events" value={totalEvents.toLocaleString()} />
        <StatCard label="Avg Fit Score" value={`${avgScore.toFixed(1)}%`} color="text-[#4361EE]" />
        <StatCard label="Saved to Pipeline" value={(actionMap.get("saved") ?? 0).toLocaleString()} color="text-emerald-400" />
        <StatCard label="Dismissed" value={(actionMap.get("dismissed") ?? 0).toLocaleString()} color="text-red-400" />
      </div>

      {/* Score Distribution */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <h2 className="text-sm font-semibold text-white/60 mb-4">Fit Score Distribution</h2>
        <div className="space-y-2">
          <DistBar label="Excellent (80+)" count={excellent} total={totalEvents || 1} color="bg-emerald-500" />
          <DistBar label="Strong (65-79)" count={strong} total={totalEvents || 1} color="bg-[#4361EE]" />
          <DistBar label="Moderate (50-64)" count={moderate} total={totalEvents || 1} color="bg-amber-500" />
          <DistBar label="Weak (35-49)" count={weak} total={totalEvents || 1} color="bg-orange-500" />
          <DistBar label="Poor (<35)" count={poor} total={totalEvents || 1} color="bg-red-500" />
        </div>
      </div>

      {/* Funnel */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <h2 className="text-sm font-semibold text-white/60 mb-4">Conversion Funnel</h2>
        <div className="flex items-center gap-2 text-xs">
          <FunnelStep label="Viewed" count={actionMap.get("viewed") ?? 0} />
          <span className="text-white/20">→</span>
          <FunnelStep label="Saved" count={actionMap.get("saved") ?? 0} />
          <span className="text-white/20">→</span>
          <FunnelStep label="Contacted" count={actionMap.get("contacted") ?? 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Saved Investors */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/60 mb-3">Most Saved Investors (Top 20)</h2>
          {topMatched.length === 0 ? (
            <p className="text-xs text-white/20">No data yet</p>
          ) : (
            <div className="space-y-1">
              {topMatched.map((t, i) => (
                <div key={t.investorProfileId} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-white/60">
                    <span className="text-white/20 mr-2">{i + 1}.</span>
                    {investorMap.get(t.investorProfileId) ?? t.investorProfileId.slice(0, 8)}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">{t._count.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Dismissed */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <h2 className="text-sm font-semibold text-white/60 mb-3">Most Dismissed (Bad Data?)</h2>
          {topDismissed.length === 0 ? (
            <p className="text-xs text-white/20">No data yet</p>
          ) : (
            <div className="space-y-1">
              {topDismissed.map((t, i) => (
                <div key={t.investorProfileId} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-white/60">
                    <span className="text-white/20 mr-2">{i + 1}.</span>
                    {investorMap.get(t.investorProfileId) ?? t.investorProfileId.slice(0, 8)}
                  </span>
                  <span className="text-xs font-mono text-red-400">{t._count.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {usersWithoutProfile > 0 && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
            <p className="text-xs font-semibold text-amber-400">
              {usersWithoutProfile} paid user{usersWithoutProfile !== 1 ? "s" : ""} without a startup profile
            </p>
            <p className="text-xs text-white/30 mt-1">
              Consider prompting them to complete their profile for better matches.
            </p>
          </div>
        )}
        {staleInvestors > 0 && (
          <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4">
            <p className="text-xs font-semibold text-orange-400">
              {staleInvestors} investor profile{staleInvestors !== 1 ? "s" : ""} with stale activity data
            </p>
            <p className="text-xs text-white/30 mt-1">
              Last active date older than 12 months. Consider reviewing.
            </p>
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white/60">Recent Match Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Action</th>
                <th className="px-5 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Investor</th>
                <th className="px-5 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Score</th>
                <th className="px-5 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-xs text-white/20">
                    No match events yet. Events will appear as users interact with investor matches.
                  </td>
                </tr>
              ) : (
                recentEvents.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-2">
                      <ActionBadge action={e.action} />
                    </td>
                    <td className="px-5 py-2 text-xs text-white/60">{e.investorProfile.name}</td>
                    <td className="px-5 py-2 text-xs font-mono text-white/50">{e.fitScore}%</td>
                    <td className="px-5 py-2 text-xs text-white/30">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-3">
      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-lg font-bold ${color || "text-white"}`}>{value}</p>
    </div>
  );
}

function DistBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = (count / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/40 w-32 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-white/5 rounded-lg overflow-hidden">
        <div className={`h-full ${color} rounded-lg transition-all`} style={{ width: `${Math.max(pct, 0.5)}%` }} />
      </div>
      <span className="text-xs font-mono text-white/30 w-12 text-right">{count}</span>
    </div>
  );
}

function FunnelStep({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-2 text-center">
      <p className="text-[10px] text-white/30 uppercase">{label}</p>
      <p className="text-sm font-bold text-white">{count}</p>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    viewed: "bg-white/5 text-white/40",
    saved: "bg-emerald-500/15 text-emerald-400",
    dismissed: "bg-red-500/15 text-red-400",
    contacted: "bg-[#4361EE]/15 text-[#4361EE]",
  };
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[action] || "bg-white/5 text-white/30"}`}>
      {action}
    </span>
  );
}
