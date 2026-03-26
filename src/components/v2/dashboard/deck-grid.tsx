"use client";

import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Card } from "@/components/v2/ui/card";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { ProgressRing } from "@/components/v2/ui/progress-ring";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useToast } from "@/components/v2/ui/toast";
import type { DeckItem } from "@/types";

interface DeckGridProps {
  decks: DeckItem[];
}

export function DeckGrid({ decks }: DeckGridProps) {
  const { addToast } = useToast();

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-neutral-900">My Decks</h2>
        <Badge variant="default" size="sm">
          {decks.length}
        </Badge>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {decks.map((deck) => (
          <motion.div key={deck.id} variants={fadeInUp}>
            <Card hover className="p-5">
              {/* Top row: score ring + PRO badge */}
              <div className="mb-3 flex items-start justify-between">
                <ProgressRing score={deck.score} size={48} strokeWidth={3} />
                {deck.isPremium && (
                  <Badge variant="primary" size="sm">
                    PRO
                  </Badge>
                )}
              </div>

              {/* Title & company */}
              <p className="truncate font-semibold text-neutral-900">
                {deck.title}
              </p>
              <p className="mb-3 truncate text-sm text-neutral-500">
                {deck.companyName}
              </p>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-neutral-400">
                  <Eye className="h-3.5 w-3.5" />
                  {deck.views}
                </span>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => addToast({ type: "info", title: "Opening Editor", description: `Loading deck editor for ${deck.title}...` })}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addToast({ type: "info", title: "Opening Preview", description: `Loading ${deck.title} in preview mode...` })}>
                    View
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
