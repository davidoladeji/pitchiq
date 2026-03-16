import Anthropic from "@anthropic-ai/sdk";
import { SlideData } from "@/lib/types";

export interface SlideTiming {
  slideIndex: number;
  duration: number;
  transcript?: string;
}

export interface PracticeFeedback {
  overallScore: number;
  pacing: {
    score: number;
    feedback: string;
  };
  perSlide: {
    slideIndex: number;
    timeFeedback: string;
    contentCoverage: string;
  }[];
  strengths: string[];
  improvements: string[];
  confidenceIndicators: string;
}

export async function generatePracticeFeedback(params: {
  slides: SlideData[];
  slideTimings: SlideTiming[];
  targetDuration: number;
  totalDuration: number;
}): Promise<PracticeFeedback> {
  const { slides, slideTimings, targetDuration, totalDuration } = params;

  const recommendedPerSlide = targetDuration / slides.length;

  const slideDetails = slides.map((slide, i) => {
    const timing = slideTimings.find((t) => t.slideIndex === i);
    return {
      index: i,
      title: slide.title,
      subtitle: slide.subtitle || "",
      content: slide.content.join("; "),
      type: slide.type,
      timeSpent: timing?.duration ?? 0,
      transcript: timing?.transcript || null,
      recommendedTime: Math.round(recommendedPerSlide),
    };
  });

  const prompt = `You are an expert pitch coach analyzing a founder's practice session for their investor pitch deck.

## Session Info
- Target duration: ${targetDuration} seconds (${Math.round(targetDuration / 60)} min)
- Actual duration: ${totalDuration} seconds (${Math.round(totalDuration / 60)} min)
- Number of slides: ${slides.length}
- Recommended time per slide: ~${Math.round(recommendedPerSlide)} seconds

## Slide-by-Slide Data
${slideDetails
  .map(
    (s) =>
      `Slide ${s.index + 1} [${s.type}] "${s.title}"
  Content: ${s.content}
  Time spent: ${s.timeSpent}s (recommended: ${s.recommendedTime}s)${s.transcript ? `\n  Transcript: "${s.transcript}"` : ""}`
  )
  .join("\n\n")}

Analyze this practice session and respond with ONLY a JSON object (no markdown, no code fences) matching this exact structure:
{
  "overallScore": <number 1-100>,
  "pacing": {
    "score": <number 1-100>,
    "feedback": "<string: overall pacing analysis — was it too fast, too slow, uneven?>"
  },
  "perSlide": [
    {
      "slideIndex": <number>,
      "timeFeedback": "<string: was time appropriate for this slide's importance?>",
      "contentCoverage": "<string: how well did time allocation match content depth needed?>"
    }
  ],
  "strengths": ["<string>", ...],
  "improvements": ["<string>", ...],
  "confidenceIndicators": "<string: analysis of timing patterns — rushing suggests nervousness, lingering suggests uncertainty, even pacing suggests confidence>"
}

Scoring guidelines:
- 90-100: Excellent pacing, good time on key slides, within target duration
- 70-89: Good overall, minor pacing issues
- 50-69: Noticeable issues — significantly over/under time, uneven pacing
- Below 50: Major timing problems

Be specific and actionable in feedback. Reference actual slide titles and timing data.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const feedback: PracticeFeedback = JSON.parse(text.trim());

    // Validate and clamp scores
    feedback.overallScore = Math.max(1, Math.min(100, Math.round(feedback.overallScore)));
    feedback.pacing.score = Math.max(1, Math.min(100, Math.round(feedback.pacing.score)));

    if (!Array.isArray(feedback.perSlide)) feedback.perSlide = [];
    if (!Array.isArray(feedback.strengths)) feedback.strengths = [];
    if (!Array.isArray(feedback.improvements)) feedback.improvements = [];
    if (typeof feedback.confidenceIndicators !== "string") feedback.confidenceIndicators = "";

    return feedback;
  } catch {
    // Fallback if AI response is not valid JSON
    return {
      overallScore: 50,
      pacing: {
        score: 50,
        feedback:
          totalDuration > targetDuration * 1.2
            ? "Your pitch ran over the target time. Try to be more concise on each slide."
            : totalDuration < targetDuration * 0.8
              ? "Your pitch was significantly shorter than the target. Consider expanding on key points."
              : "Your overall timing was reasonable, but we could not generate detailed AI feedback.",
      },
      perSlide: slides.map((_, i) => ({
        slideIndex: i,
        timeFeedback: "Unable to generate detailed feedback for this slide.",
        contentCoverage: "Unable to analyze content coverage.",
      })),
      strengths: ["Completed the practice session"],
      improvements: ["Try running the practice again for more detailed AI feedback"],
      confidenceIndicators:
        "Unable to analyze confidence indicators from this session.",
    };
  }
}
