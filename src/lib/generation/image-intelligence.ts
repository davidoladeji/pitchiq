import Anthropic from "@anthropic-ai/sdk";
import type { VisualPersonality } from "./company-dna";

/* ------------------------------------------------------------------ */
/*  Image Intelligence — smart stock image search                      */
/* ------------------------------------------------------------------ */

interface ImageSearchOptions {
  industry: string;
  visualStyle: VisualPersonality;
  treatment: string;
}

/**
 * Enhance a raw image prompt into 3 diverse search queries using AI.
 */
export async function enhanceImagePrompt(
  rawPrompt: string,
  context: { industry: string; visualPersonality: VisualPersonality; slidePurpose: string },
): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return generateHeuristicQueries(rawPrompt, context.industry);
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: `Generate 3 diverse Unsplash search queries for a pitch deck slide image.

Raw prompt: "${rawPrompt}"
Industry: ${context.industry}
Visual style: ${context.visualPersonality}
Slide purpose: ${context.slidePurpose}

Return ONLY a JSON array of 3 strings. Each should be 3-5 keywords, specific and searchable.
Approach: 1) Literal scene, 2) Abstract/conceptual, 3) Industry-specific
Example: ["SaaS analytics dashboard laptop screen", "data visualization growth concept", "fintech office modern workspace"]`,
      }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 3);
  } catch {
    // Fall through to heuristic
  }

  return generateHeuristicQueries(rawPrompt, context.industry);
}

function generateHeuristicQueries(rawPrompt: string, industry: string): string[] {
  const keywords = rawPrompt.replace(/[^\w\s]/g, "").split(/\s+/).slice(0, 5).join(" ");
  return [
    keywords,
    `${industry} technology professional`,
    `${industry} modern business concept`,
  ];
}

/**
 * Search Unsplash with multiple strategies and pick the best result.
 */
export async function searchImage(
  prompt: string,
  options: ImageSearchOptions,
): Promise<string | null> {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!unsplashKey) return null;

  // Generate enhanced queries
  const queries = await enhanceImagePrompt(prompt, {
    industry: options.industry,
    visualPersonality: options.visualStyle,
    slidePurpose: prompt,
  });

  // Search with all queries in parallel
  const results = await Promise.all(
    queries.map((query) => searchUnsplash(query, unsplashKey))
  );

  // Pick the first non-null result
  return results.find((url) => url !== null) || null;
}

async function searchUnsplash(query: string, apiKey: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(query.slice(0, 100));
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encoded}&per_page=3&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${apiKey}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Return the first result with good resolution
    const photo = data.results?.[0];
    return photo?.urls?.regular || null;
  } catch {
    return null;
  }
}

/**
 * Enrich all image-content slides with stock images.
 */
export async function enrichSlidesWithImages(
  slides: import("@/lib/types").SlideData[],
  industry: string,
  visualStyle: VisualPersonality,
): Promise<void> {
  const imageSlides = slides.filter(
    (s) => (s.type === "image-content" || s.imagePrompt) && !s.imageUrl
  );

  if (imageSlides.length === 0) return;

  await Promise.all(
    imageSlides.map(async (slide) => {
      if (!slide.imagePrompt) return;
      const url = await searchImage(slide.imagePrompt, {
        industry,
        visualStyle,
        treatment: "landscape",
      });
      if (url) slide.imageUrl = url;
    })
  );
}
