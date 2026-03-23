"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { DeckInput } from "@/lib/types";
import type { GenerationProgressEvent } from "@/lib/generation/skills/types";
import {
  Sparkles, Search, BarChart3, Palette, ShieldCheck, CheckCircle2,
  Loader2, Clock, AlertCircle, TrendingUp, Users, DollarSign,
  Eye, MessageSquare, FileCheck, Paintbrush,
} from "lucide-react";

interface GenerationProgressProps {
  input: DeckInput;
  enableSkills: boolean;
  onComplete: (deck: { shareId: string; slides: unknown[]; piqScore: unknown }) => void;
  onError: (error: string) => void;
}

interface SkillStatus {
  id: string;
  name: string;
  icon: React.ElementType;
  status: "waiting" | "running" | "completed" | "failed" | "skipped";
  message: string;
}

const SKILL_META: Record<string, { name: string; icon: React.ElementType }> = {
  "company-dna": { name: "Company Analysis", icon: Sparkles },
  "market-researcher": { name: "Market Research", icon: Search },
  "competitor-analyst": { name: "Competitor Analysis", icon: Users },
  "financial-modeler": { name: "Financial Model", icon: DollarSign },
  "industry-data": { name: "Industry Data", icon: TrendingUp },
  "slide-generator": { name: "Slide Generation", icon: BarChart3 },
  "basic": { name: "Deck Generation", icon: BarChart3 },
  "image-finder": { name: "Image Search", icon: Eye },
  "diagram-generator": { name: "Diagram Creation", icon: Paintbrush },
  "mockup-generator": { name: "Product Mockups", icon: Palette },
  "icon-selector": { name: "Icon Selection", icon: Sparkles },
  "vc-analyst": { name: "VC Analysis", icon: ShieldCheck },
  "pitch-coach": { name: "Pitch Review", icon: MessageSquare },
  "data-credibility": { name: "Data Check", icon: FileCheck },
  "design-reviewer": { name: "Design Review", icon: Paintbrush },
  "piq-score": { name: "PIQ Scoring", icon: BarChart3 },
  "auto-fix": { name: "Auto-Fix", icon: CheckCircle2 },
};

export default function GenerationProgress({ input, enableSkills, onComplete, onError }: GenerationProgressProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("Starting...");
  const [skills, setSkills] = useState<SkillStatus[]>([]);
  const [, setSources] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const updateSkill = useCallback((skillId: string, status: SkillStatus["status"], message: string) => {
    setSkills((prev) => {
      const exists = prev.find((s) => s.id === skillId);
      if (exists) {
        return prev.map((s) => s.id === skillId ? { ...s, status, message } : s);
      }
      const meta = SKILL_META[skillId] || { name: skillId, icon: Sparkles };
      return [...prev, { id: skillId, name: meta.name, icon: meta.icon, status, message }];
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    async function run() {
      try {
        const res = await fetch("/api/decks/generate-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, enableSkills }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          onError(err.error || "Generation failed");
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) { onError("No stream"); return; }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataLine = line.replace(/^data: /, "").trim();
            if (!dataLine) continue;

            try {
              const event = JSON.parse(dataLine);

              // Check if this is the final result
              if (event.type === "result" && event.deck) {
                onComplete(event.deck);
                return;
              }

              // Progress event
              const pe = event as GenerationProgressEvent;
              if (pe.progress) setProgress(pe.progress);
              if (pe.phase) setCurrentPhase(pe.phase);
              if (pe.skill) {
                const status = pe.status === "started" ? "running" : pe.status === "completed" ? "completed" : pe.status === "failed" ? "failed" : "waiting";
                updateSkill(pe.skill, status, pe.message);
              }
              if (pe.message && pe.message.includes("Source:")) {
                setSources((prev) => Array.from(new Set([...prev, pe.message])));
              }
            } catch { /* skip malformed lines */ }
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          onError(String(err));
        }
      }
    }

    run();
    return () => controller.abort();
  }, [input, enableSkills, onComplete, onError, updateSkill, router]);

  const completedSkills = skills.filter((s) => s.status === "completed");
  const runningSkills = skills.filter((s) => s.status === "running");

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-white/10 bg-navy-900/80 backdrop-blur-sm p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet/20 flex items-center justify-center">
            <Sparkles size={18} className="text-violet-light" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Creating your pitch deck</h2>
            <p className="text-xs text-white/40">{currentPhase}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-white/30 text-right tabular-nums">{progress}%</p>
        </div>

        {/* Skill status list */}
        {skills.length > 0 && (
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <div key={skill.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors hover:bg-white/5">
                  {/* Status icon */}
                  {skill.status === "completed" ? (
                    <CheckCircle2 size={14} className="text-emerald shrink-0" />
                  ) : skill.status === "running" ? (
                    <Loader2 size={14} className="text-violet-light animate-spin shrink-0" />
                  ) : skill.status === "failed" ? (
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                  ) : (
                    <Clock size={14} className="text-white/20 shrink-0" />
                  )}
                  {/* Skill icon + name */}
                  <Icon size={12} className="text-white/30 shrink-0" />
                  <span className={`text-xs font-medium flex-1 truncate ${skill.status === "completed" ? "text-white/70" : skill.status === "running" ? "text-white" : "text-white/30"}`}>
                    {skill.name}
                  </span>
                  {/* Result summary */}
                  {skill.status === "completed" && skill.message && (
                    <span className="text-[10px] text-white/40 truncate max-w-[140px]">{skill.message}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sources footer */}
        {completedSkills.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] text-white/25 flex items-center gap-1">
              <Search size={10} />
              {enableSkills
                ? `${completedSkills.length} skills completed${runningSkills.length > 0 ? `, ${runningSkills.length} running` : ""}`
                : "Basic generation"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
