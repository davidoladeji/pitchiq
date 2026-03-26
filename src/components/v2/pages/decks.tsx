"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Eye, LayoutGrid, List, Plus, Pencil, ExternalLink } from "lucide-react";

import { staggerContainer, fadeInUp } from "@/lib/animations";
import { mockDecks } from "@/lib/mock-data";

type DeckItem = (typeof mockDecks)[number];

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardContent } from "@/components/v2/ui/card";
import { Input } from "@/components/v2/ui/input";
import { Select } from "@/components/v2/ui/select";
import { ProgressRing } from "@/components/v2/ui/progress-ring";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/v2/ui/table";

const themeOptions = [
  { value: "all", label: "All Themes" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
  { value: "classic", label: "Classic" },
];

const sortOptions = [
  { value: "score", label: "Score" },
  { value: "views", label: "Views" },
  { value: "date", label: "Date" },
];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DecksPage({ decks: propDecks }: { decks?: DeckItem[] } = {}) {
  const allDecks = propDecks && propDecks.length > 0 ? propDecks : mockDecks;
  const [searchQuery, setSearchQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredDecks = useMemo(() => {
    let result = allDecks.filter((deck: DeckItem) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        deck.title.toLowerCase().includes(q) ||
        deck.companyName.toLowerCase().includes(q);
      const matchTheme = themeFilter === "all" || deck.theme === themeFilter;
      return matchSearch && matchTheme;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "views") return b.views - a.views;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [searchQuery, themeFilter, sortBy]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">My Decks</h1>
          <Badge variant="primary" size="lg">
            {mockDecks.length}
          </Badge>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Deck
        </Button>
      </motion.div>

      {/* Search / Filter row */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            options={themeOptions}
            value={themeFilter}
            onChange={setThemeFilter}
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredDecks.map((deck) => (
            <motion.div key={deck.id} variants={fadeInUp}>
              <Card hover className="p-5">
                <div className="flex items-start gap-4">
                  <ProgressRing score={deck.score} size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {deck.title}
                      </h3>
                      {deck.isPremium && (
                        <Badge variant="primary" size="sm">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">{deck.companyName}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {deck.views} views
                  </span>
                  <span>{relativeTime(deck.updatedAt)}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="pt-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecks.map((deck) => (
                    <TableRow key={deck.id}>
                      <TableCell>
                        <ProgressRing score={deck.score} size={32} strokeWidth={2.5} />
                      </TableCell>
                      <TableCell className="font-medium text-neutral-900">
                        {deck.title}
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {deck.companyName}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-neutral-500">
                          <Eye className="h-3.5 w-3.5" />
                          {deck.views}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge>{capitalize(deck.theme)}</Badge>
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {relativeTime(deck.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
