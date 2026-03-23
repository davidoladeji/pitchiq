import type { Skill, ImageFinderOutput } from "../types";
import { enhanceImagePrompt, searchImage } from "../../image-intelligence";
import type { VisualPersonality } from "../../company-dna";

interface ImageFinderInput {
  slides: { id: string; purpose: string; type: string; imagePrompt?: string }[];
  industry: string;
  visualPersonality: VisualPersonality;
}

export const imageFinderSkill: Skill<ImageFinderInput, ImageFinderOutput> = {
  id: "image-finder",
  name: "Intelligent Image Finder",
  category: "visual",
  description: "Finds highly relevant, high-quality images for each slide using multi-strategy search",
  requiresExternalAPI: true,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();
    const slidesNeedingImages = input.slides.filter(
      (s) => s.type === "image-content" || s.imagePrompt || ["problem-visual", "solution-reveal", "product-showcase"].includes(s.purpose)
    );

    if (slidesNeedingImages.length === 0) {
      return { success: true, data: { images: [] }, confidence: 1, sources: [], durationMs: Date.now() - start, usedFallback: false };
    }

    const images = await Promise.all(
      slidesNeedingImages.map(async (slide) => {
        const rawPrompt = slide.imagePrompt || `${input.industry} ${slide.purpose}`;
        const queries = ctx.hasAnthropicKey
          ? await enhanceImagePrompt(rawPrompt, { industry: input.industry, visualPersonality: input.visualPersonality, slidePurpose: slide.purpose })
          : [rawPrompt, `${input.industry} professional`, `${slide.purpose} concept`];

        let primaryImage: { url: string; alt: string; attribution: string } | null = null;
        if (ctx.hasUnsplashKey) {
          const url = await searchImage(rawPrompt, { industry: input.industry, visualStyle: input.visualPersonality, treatment: "landscape" });
          if (url) primaryImage = { url, alt: `${slide.purpose} visual for ${input.industry}`, attribution: "Unsplash" };
        }

        return {
          slideId: slide.id,
          purpose: slide.purpose,
          primaryImage,
          alternateImages: [] as { url: string; alt: string }[],
          searchQueries: queries,
        };
      })
    );

    const found = images.filter((i) => i.primaryImage).length;
    return {
      success: true,
      data: { images },
      confidence: found / Math.max(images.length, 1),
      sources: ["Unsplash"],
      durationMs: Date.now() - start,
      usedFallback: !ctx.hasUnsplashKey,
    };
  },
};
