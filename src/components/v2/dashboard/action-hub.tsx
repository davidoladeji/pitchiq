"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Upload, Lightbulb, Building2, BookOpen,
  Sparkles, ArrowRight, Target, Brain,
  Award, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/v2/ui/card";
import { Button } from "@/components/v2/ui/button";
import { cn } from "@/lib/cn";

import type { DailyDataPoint } from "./analytics-chart";
import type { DeckItem } from "@/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ActionHubProps {
  dailyViews: DailyDataPoint[];
  decks: DeckItem[];
  avgScore: number;
  totalViews: number;
}

type TabId = "views" | "create" | "score" | "ideas" | "profile" | "guide";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  primary?: boolean;
}

const TABS: Tab[] = [
  { id: "create", label: "New Deck", icon: Plus, primary: true },
  { id: "score", label: "Upload & Score", icon: Upload },
  { id: "ideas", label: "Explore Ideas", icon: Lightbulb },
  { id: "profile", label: "Startup Profile", icon: Building2 },
  { id: "guide", label: "PIQ Score Guide", icon: BookOpen },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ActionHub({ dailyViews, decks, avgScore, totalViews }: ActionHubProps) {
  const [activeTab, setActiveTab] = useState<TabId>("views");
  const router = useRouter();

  return (
    <div className="space-y-0">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(isActive ? "views" : tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                tab.primary && !isActive
                  ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                  : isActive
                    ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel area — chart is default, widgets replace it */}
      <Card className="overflow-hidden">
        {activeTab === "views" && (
          <ViewsPanel dailyViews={dailyViews} />
        )}
        {activeTab === "create" && (
          <CreateDeckWidget onNavigate={() => router.push("/create")} />
        )}
        {activeTab === "score" && (
          <ScoreDeckWidget onNavigate={() => router.push("/score")} avgScore={avgScore} />
        )}
        {activeTab === "ideas" && (
          <ExploreIdeasWidget onNavigate={() => router.push("/ideas")} />
        )}
        {activeTab === "profile" && (
          <StartupProfileWidget onNavigate={() => router.push("/dashboard/startup-profile")} />
        )}
        {activeTab === "guide" && (
          <PIQGuideWidget avgScore={avgScore} totalViews={totalViews} decks={decks} />
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Views Panel (the chart — default state)                            */
/* ------------------------------------------------------------------ */

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TooltipPayloadItem { value: number; payload: DailyDataPoint; }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs text-neutral-500">{formatDateLabel(item.payload.date)}</p>
      <p className="text-sm font-semibold text-primary-700">{item.value.toLocaleString()} views</p>
    </div>
  );
}

function ViewsPanel({ dailyViews }: { dailyViews: DailyDataPoint[] }) {
  return (
    <>
      <CardHeader>
        <CardTitle>Views — Last 30 Days</CardTitle>
        <CardDescription>Daily deck views</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dailyViews} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hubChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ef" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} dy={8} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="url(#hubChartGrad)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  New Deck Widget                                                    */
/* ------------------------------------------------------------------ */

function CreateDeckWidget({ onNavigate }: { onNavigate: () => void }) {
  const [companyName, setCompanyName] = useState("");

  return (
    <CardContent className="py-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto">
          <Sparkles size={24} className="text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Create a New Pitch Deck</h3>
          <p className="text-sm text-neutral-500 mt-1">AI generates an investor-ready deck from your company details</p>
        </div>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name..."
            className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
            onKeyDown={(e) => { if (e.key === "Enter" && companyName) onNavigate(); }}
          />
          <Button onClick={onNavigate}>
            Create <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
        <div className="flex justify-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> 10-14 slides</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Auto-scored</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Export ready</span>
        </div>
      </div>
    </CardContent>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Deck Widget                                                  */
/* ------------------------------------------------------------------ */

function ScoreDeckWidget({ onNavigate, avgScore }: { onNavigate: () => void; avgScore: number }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <CardContent className="py-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto">
          <Target size={24} className="text-violet-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Score an Existing Deck</h3>
          <p className="text-sm text-neutral-500 mt-1">Upload your PDF or PPTX and get an instant PIQ fundability score</p>
        </div>
        <div
          onClick={onNavigate}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "cursor-pointer rounded-xl border-2 border-dashed p-6 transition-all",
            dragOver ? "border-primary-400 bg-primary-50" : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
          )}
        >
          <Upload size={20} className="text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Drop your deck here or click to upload</p>
          <div className="flex justify-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-mono text-neutral-500">PDF</span>
            <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-mono text-neutral-500">PPTX</span>
          </div>
        </div>
        {avgScore > 0 && (
          <p className="text-xs text-neutral-400">Your current avg PIQ score: <span className="font-semibold text-primary-600">{avgScore}</span></p>
        )}
      </div>
    </CardContent>
  );
}

/* ------------------------------------------------------------------ */
/*  Explore Ideas Widget                                               */
/* ------------------------------------------------------------------ */

function ExploreIdeasWidget({ onNavigate }: { onNavigate: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);

  const quickGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "trending startup ideas" }),
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(Array.isArray(data.ideas) ? data.ideas.slice(0, 3) : []);
      }
    } catch { /* ignore */ }
    setGenerating(false);
  }, []);

  return (
    <CardContent className="py-8">
      <div className="max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto">
          <Lightbulb size={24} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Explore Business Ideas</h3>
          <p className="text-sm text-neutral-500 mt-1">Not sure what to pitch? Let AI brainstorm ideas based on trends and markets</p>
        </div>

        {ideas.length > 0 ? (
          <div className="space-y-2 text-left">
            {ideas.map((idea, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                <Brain size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-neutral-700">{idea}</p>
              </div>
            ))}
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={quickGenerate} disabled={generating}>
                {generating ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Generate More
              </Button>
              <Button size="sm" onClick={onNavigate}>
                Open Full Explorer <ArrowRight size={12} className="ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={quickGenerate} disabled={generating}>
              {generating ? <Loader2 size={14} className="animate-spin mr-1" /> : <Sparkles size={14} className="mr-1" />}
              Quick Generate
            </Button>
            <Button onClick={onNavigate}>
              Open Ideas Explorer <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  );
}

/* ------------------------------------------------------------------ */
/*  Startup Profile Widget                                             */
/* ------------------------------------------------------------------ */

function StartupProfileWidget({ onNavigate }: { onNavigate: () => void }) {
  const [profile, setProfile] = useState<{ companyName?: string; industry?: string; stage?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/startup-profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setProfile(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CardContent className="py-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
          <Building2 size={24} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Startup Profile</h3>
          <p className="text-sm text-neutral-500 mt-1">Your company profile powers investor matching and personalized recommendations</p>
        </div>

        {loading ? (
          <div className="flex justify-center"><Loader2 size={20} className="animate-spin text-neutral-300" /></div>
        ) : profile?.companyName ? (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">{profile.companyName}</span>
              {profile.industry && <span className="text-xs text-emerald-500">· {profile.industry}</span>}
              {profile.stage && <span className="text-xs text-emerald-500">· {profile.stage}</span>}
            </div>
            <div>
              <Button variant="outline" onClick={onNavigate}>Edit Profile <ArrowRight size={12} className="ml-1" /></Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-sm text-amber-700">No profile set up yet</span>
            </div>
            <div>
              <Button onClick={onNavigate}>Set Up Profile <ArrowRight size={14} className="ml-1" /></Button>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
}

/* ------------------------------------------------------------------ */
/*  PIQ Score Guide Widget                                             */
/* ------------------------------------------------------------------ */

function PIQGuideWidget({ avgScore, totalViews, decks }: { avgScore: number; totalViews: number; decks: DeckItem[] }) {
  const dimensions = [
    { label: "Narrative Structure", weight: "15%", description: "Story flow from problem to ask" },
    { label: "Market Sizing", weight: "15%", description: "TAM/SAM/SOM clarity and data quality" },
    { label: "Competitive Differentiation", weight: "12%", description: "Unique value prop and defensive moat" },
    { label: "Financial Clarity", weight: "15%", description: "Revenue model, projections, unit economics" },
    { label: "Team Presentation", weight: "10%", description: "Founder credibility and experience" },
    { label: "Ask Justification", weight: "13%", description: "Funding rationale and use of funds" },
    { label: "Design Quality", weight: "10%", description: "Visual hierarchy and readability" },
    { label: "Data Credibility", weight: "10%", description: "Traction evidence and validated metrics" },
  ];

  const bestDeck = decks.length > 0 ? decks.reduce((a, b) => (a.score > b.score ? a : b)) : null;

  return (
    <CardContent className="py-6">
      <div className="space-y-5">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-neutral-900">PIQ Score Methodology</h3>
          <p className="text-sm text-neutral-500 mt-1">How we evaluate your pitch deck across 8 investor-readiness dimensions</p>
        </div>

        {/* Your stats summary */}
        {avgScore > 0 && (
          <div className="flex justify-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-primary-50 text-center">
              <p className="text-xl font-bold text-primary-700">{avgScore}</p>
              <p className="text-[10px] text-primary-500 uppercase tracking-wide">Avg Score</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-neutral-50 text-center">
              <p className="text-xl font-bold text-neutral-700">{decks.length}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Decks</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-neutral-50 text-center">
              <p className="text-xl font-bold text-neutral-700">{totalViews}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Views</p>
            </div>
            {bestDeck && (
              <div className="px-4 py-2 rounded-xl bg-emerald-50 text-center">
                <p className="text-xl font-bold text-emerald-700">{bestDeck.score}</p>
                <p className="text-[10px] text-emerald-500 uppercase tracking-wide">Best</p>
              </div>
            )}
          </div>
        )}

        {/* Dimensions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dimensions.map((dim) => (
            <div key={dim.label} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <Award size={14} className="text-primary-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-neutral-800">{dim.label}</p>
                  <span className="text-[10px] font-semibold text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded">{dim.weight}</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{dim.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  );
}
