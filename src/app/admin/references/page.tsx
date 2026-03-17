"use client";

import { useState, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Category = "database" | "curated" | "github" | "iconic";

interface ReferenceSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: Category;
  deckCount: number | null;
  highlight?: string;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const REFERENCES: ReferenceSource[] = [
  // Databases
  {
    id: "derstartupcfo",
    name: "DerStartupCFO",
    description: "The largest collection of successful startup pitch decks. Searchable by stage and industry — includes Spotify, Tesla, Airbnb, Uber, LinkedIn.",
    url: "https://www.derstartupcfo.com/en/pitchdeck-database",
    category: "database",
    deckCount: 2500,
  },
  {
    id: "bestpitchdeck",
    name: "Best Pitch Deck",
    description: "Winning pitch deck examples from high-growth startups across every industry. Filterable by sector and funding round.",
    url: "https://bestpitchdeck.com/",
    category: "database",
    deckCount: 1400,
  },
  {
    id: "vipgraphics",
    name: "VIP Graphics",
    description: "Searchable library covering nearly every startup stage and industry from seed to Series F. Detailed slide-by-slide analysis.",
    url: "https://vip.graphics/pitch-deck-database/",
    category: "database",
    deckCount: 800,
  },
  {
    id: "angelmatch",
    name: "AngelMatch",
    description: "Large collection of investor decks organized by industry. Used by the world's best startups to raise capital.",
    url: "https://angelmatch.io/pitch_decks/by-industry/open-source",
    category: "database",
    deckCount: 500,
  },

  // Curated
  {
    id: "slidebean",
    name: "Slidebean",
    description: "35+ pitch deck teardowns with slide-by-slide expert analysis. Deep breakdowns of structure, design, and messaging.",
    url: "https://slidebean.com/blog/startups-pitch-deck-examples",
    category: "curated",
    deckCount: 35,
  },
  {
    id: "basetemplates",
    name: "BaseTemplates",
    description: "200+ real pitch deck examples from startups and unicorns. Includes downloadable templates and formatting guides.",
    url: "https://www.basetemplates.com/pitch-deck-examples",
    category: "curated",
    deckCount: 200,
  },
  {
    id: "piktochart",
    name: "Piktochart",
    description: "37 legendary pitch decks with detailed breakdowns of what made each one effective for fundraising.",
    url: "https://piktochart.com/blog/startup-pitch-decks-what-you-can-learn/",
    category: "curated",
    deckCount: 37,
  },
  {
    id: "alexanderjarvis",
    name: "Alexander Jarvis",
    description: "Curated startup pitch deck collection with strategic commentary. Covers multiple industries and funding stages.",
    url: "https://www.alexanderjarvis.com/resources/collections/startup-pitch-deck-collection/",
    category: "curated",
    deckCount: 100,
  },

  // GitHub
  {
    id: "joelparkerhenderson",
    name: "joelparkerhenderson/pitch-deck",
    description: "Comprehensive pitch deck advice and structure guidelines for startup founders seeking venture capital investment.",
    url: "https://github.com/joelparkerhenderson/pitch-deck",
    category: "github",
    deckCount: null,
  },
  {
    id: "awesome-decks",
    name: "rafaecheve/Awesome-Decks",
    description: "Curated list of pitch deck slides following the awesome-list pattern. Community-maintained and regularly updated.",
    url: "https://github.com/rafaecheve/Awesome-Decks",
    category: "github",
    deckCount: null,
  },
  {
    id: "smartpitchdeck",
    name: "SmartPitchDeckEvaluation",
    description: "ML-based pitch deck scorer using Random Forest and Gradient Boosting. Advanced text extraction with NLTK preprocessing.",
    url: "https://github.com/preetham-reddy-bathula/SmartPitchDeckEvaluation-using-MachineLearning",
    category: "github",
    deckCount: null,
  },

  // Iconic
  {
    id: "airbnb",
    name: "Airbnb",
    description: "One of the most studied pitch decks in history. No fluff, no jargon — every slide gets straight to the point. Opening statement: \"Book rooms with locals, rather than hotels.\"",
    url: "https://www.failory.com/pitch-deck/airbnb",
    category: "iconic",
    deckCount: null,
    highlight: "Raised $600K from Sequoia Capital",
  },
  {
    id: "uber",
    name: "Uber",
    description: "Rough and visually unimpressive, but sells a vision so convincingly that investors could not ignore it. Proof that substance beats design.",
    url: "https://slidebean.com/blog/startups-pitch-deck-examples",
    category: "iconic",
    deckCount: null,
    highlight: "Raised $200K in 2008",
  },
  {
    id: "sequoia",
    name: "Sequoia Capital Format",
    description: "The gold-standard pitch deck template used by Airbnb, Dropbox, and WhatsApp. 10-20 slides covering problem, solution, market, and team.",
    url: "https://articles.sequoiacap.com/writing-a-business-plan",
    category: "iconic",
    deckCount: null,
    highlight: "Template behind $100B+ in funded startups",
  },
];

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */

const CATEGORIES: Record<Category, { label: string; badgeCls: string }> = {
  database: { label: "Database", badgeCls: "bg-electric/15 text-electric" },
  curated: { label: "Curated", badgeCls: "bg-violet/15 text-violet-300" },
  github: { label: "GitHub Repo", badgeCls: "bg-emerald-500/15 text-emerald-400" },
  iconic: { label: "Iconic Deck", badgeCls: "bg-amber-500/15 text-amber-400" },
};

const FILTER_TABS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "database", label: "Databases" },
  { key: "curated", label: "Curated" },
  { key: "github", label: "GitHub" },
  { key: "iconic", label: "Iconic" },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl bg-white/[0.03] border border-white/5 p-5 overflow-hidden">
      <div className="absolute top-4 right-4 text-white/10">{icon}</div>
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const cfg = CATEGORIES[category];
  return (
    <span className={`inline-flex items-center text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${cfg.badgeCls}`}>
      {cfg.label}
    </span>
  );
}

function DeckCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg">
      {count.toLocaleString()} decks
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3.5 h-3.5 inline-block ml-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function ReferenceCard({ item }: { item: ReferenceSource }) {
  return (
    <div className="group rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center gap-2 flex-wrap">
        <CategoryBadge category={item.category} />
        {item.deckCount && <DeckCountBadge count={item.deckCount} />}
      </div>
      <h3 className="text-sm font-semibold text-white mt-3">{item.name}</h3>
      <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{item.description}</p>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-xs text-electric hover:text-electric-light mt-3 transition-colors"
      >
        Visit source
        <ExternalLinkIcon />
      </a>
    </div>
  );
}

function IconicCard({ item }: { item: ReferenceSource }) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/10 to-violet/10 border border-amber-500/20 p-6 overflow-hidden">
      {/* Corner badge */}
      <div className="absolute top-4 right-4">
        <span className="text-[9px] uppercase tracking-widest font-bold text-amber-500/50">Iconic</span>
      </div>
      {/* Star decoration */}
      <div className="text-amber-500/20 mb-3">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-white">{item.name}</h3>
      {item.highlight && (
        <p className="text-sm text-amber-400 font-semibold mt-1">{item.highlight}</p>
      )}
      <p className="text-sm text-white/50 mt-2 leading-relaxed">{item.description}</p>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-xs text-amber-400 hover:text-amber-300 mt-4 transition-colors"
      >
        View deck analysis
        <ExternalLinkIcon />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat icons                                                         */
/* ------------------------------------------------------------------ */

const IconDatabase = (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </svg>
);

const IconCollection = (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0L12 17.25 6.429 14.25m11.142 0l4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25" />
  </svg>
);

const IconStar = (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const IconChart = (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminReferencesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "deckCount">("deckCount");

  /* Derived data */
  const totalDecks = useMemo(
    () => REFERENCES.reduce((sum, r) => sum + (r.deckCount ?? 0), 0),
    [],
  );

  const filtered = useMemo(() => {
    let items =
      activeCategory === "all"
        ? REFERENCES.filter((r) => r.category !== "iconic")
        : activeCategory === "iconic"
          ? [] // iconic shown in its own section
          : REFERENCES.filter((r) => r.category === activeCategory);

    if (sortBy === "deckCount") {
      items = [...items].sort((a, b) => (b.deckCount ?? 0) - (a.deckCount ?? 0));
    } else {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    }
    return items;
  }, [activeCategory, sortBy]);

  const iconicDecks = REFERENCES.filter((r) => r.category === "iconic");
  const showIconic = activeCategory === "all" || activeCategory === "iconic";

  const dbCount = REFERENCES.filter((r) => r.category === "database").length;
  const iconicCount = iconicDecks.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reference Library</h1>
        <p className="text-sm text-white/40 mt-1">
          Pitch deck databases, collections, and iconic examples for training and generation improvement
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sources" value={REFERENCES.length} icon={IconCollection} />
        <StatCard label="Total Decks Available" value={`${(totalDecks / 1000).toFixed(1)}K+`} icon={IconChart} />
        <StatCard label="Database Sources" value={dbCount} icon={IconDatabase} />
        <StatCard label="Iconic Decks" value={iconicCount} icon={IconStar} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              activeCategory === tab.key
                ? "bg-electric/15 text-electric border-electric/20"
                : "bg-white/5 text-white/40 hover:text-white/70 border-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Sort toggle */}
        <div className="ml-auto flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-0.5">
          <button
            onClick={() => setSortBy("deckCount")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "deckCount" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            By Count
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === "name" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            By Name
          </button>
        </div>
      </div>

      {/* Reference Cards Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <ReferenceCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Iconic Decks Section */}
      {showIconic && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <h2 className="text-lg font-bold text-white">Iconic Decks</h2>
            <span className="text-xs text-white/30">Proven fundraising templates worth studying</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {iconicDecks.map((item) => (
              <IconicCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !showIconic && (
        <div className="text-center py-16">
          <p className="text-white/30 text-sm">No sources found for this category.</p>
        </div>
      )}
    </div>
  );
}
