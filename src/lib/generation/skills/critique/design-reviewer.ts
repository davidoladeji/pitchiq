import type { Skill, DesignReviewOutput } from "../types";
import type { SlideData } from "@/lib/types";

interface DesignReviewInput { slides: SlideData[] }

export const designReviewerSkill: Skill<DesignReviewInput, DesignReviewOutput> = {
  id: "design-reviewer",
  name: "Design Reviewer",
  category: "critique",
  description: "Reviews visual composition, variety, and professional quality",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input) {
    const start = Date.now();
    const slides = input.slides;
    const issues: DesignReviewOutput["issues"] = [];

    // Check composition variety
    const types = new Set(slides.map((s) => s.type));
    const typeVariety = Math.min(100, (types.size / Math.max(slides.length * 0.5, 1)) * 100);

    // Check density rhythm
    const DATA_TYPES = new Set(["chart", "metrics", "table", "stats"]);
    let maxConsecutiveDense = 0;
    let currentDense = 0;
    for (const slide of slides) {
      if (DATA_TYPES.has(slide.type)) { currentDense++; maxConsecutiveDense = Math.max(maxConsecutiveDense, currentDense); }
      else currentDense = 0;
    }
    const rhythmScore = maxConsecutiveDense <= 2 ? 100 : maxConsecutiveDense <= 3 ? 60 : 30;

    if (maxConsecutiveDense > 2) {
      const idx = slides.findIndex((_, i) => {
        let count = 0;
        for (let j = i; j < Math.min(i + 3, slides.length); j++) { if (DATA_TYPES.has(slides[j].type)) count++; }
        return count >= 3;
      });
      if (idx >= 0) issues.push({ slideIndex: idx + 2, issue: "3+ data-dense slides in a row — audience fatigue", category: "density", suggestedFix: "Insert a visual breather or statement slide" });
    }

    // Check for text-heavy slides
    slides.forEach((s, i) => {
      if (s.type === "content" && s.content.length > 5) {
        issues.push({ slideIndex: i, issue: "Text-heavy slide — too many bullet points", category: "density", suggestedFix: "Split into 2 slides or add a visual element" });
      }
    });

    // Check visual impact moments
    const accentCount = slides.filter((s) => s.accent).length;
    if (accentCount < 3) {
      issues.push({ slideIndex: 0, issue: `Only ${accentCount} accent slides — deck may feel flat`, category: "variety", suggestedFix: "Add accent to 3-5 key slides" });
    }

    // Check opening and closing
    if (slides.length > 0 && slides[0].type !== "title" && !slides[0].accent) {
      issues.push({ slideIndex: 0, issue: "Opening slide lacks visual impact", category: "contrast", suggestedFix: "Make the first slide a bold visual statement" });
    }

    return {
      success: true,
      data: { compositionVariety: typeVariety, informationDensityRhythm: rhythmScore, visualImpactMoments: accentCount, issues },
      confidence: 0.9,
      sources: ["Rule-based analysis"],
      durationMs: Date.now() - start,
      usedFallback: false,
    };
  },
};
