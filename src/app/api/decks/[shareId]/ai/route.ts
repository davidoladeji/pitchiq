import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { PIQ_DIMENSIONS } from "@/lib/piq-dimensions";

/**
 * POST /api/decks/[shareId]/ai
 * AI coaching endpoints for the editor.
 * Body: { action: "coach" | "rewrite" | "investor-lens" | "simulate", ... }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI features require API key configuration" },
      { status: 503 }
    );
  }

  const deck = await prisma.deck.findUnique({
    where: { shareId: params.shareId },
    select: { userId: true, slides: true, title: true, companyName: true, piqScore: true },
  });

  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      case "coach":
        return handleCoach(apiKey, deck, body);
      case "rewrite":
        return handleRewrite(apiKey, body);
      case "investor-lens":
        return handleInvestorLens(apiKey, deck, body);
      case "simulate":
        return handleSimulate(apiKey, deck);
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error(`[AI/${action}] Error:`, err);
    return NextResponse.json(
      { error: "AI processing failed" },
      { status: 500 }
    );
  }
}

/* ── Coach: Per-slide AI feedback ────────────────────────────────────── */

async function handleCoach(
  apiKey: string,
  deck: { slides: string; companyName: string },
  body: { slideIndex: number }
) {
  const slides = JSON.parse(deck.slides);
  const slide = slides[body.slideIndex];
  if (!slide) {
    return NextResponse.json({ error: "Slide not found" }, { status: 400 });
  }

  const dimensionList = PIQ_DIMENSIONS.map(
    (d) => `${d.label} (${d.weight}%): ${d.description}`
  ).join("\n");

  const prompt = `You are an expert pitch deck coach. Analyze this single slide and provide feedback for each relevant PIQ Score dimension.

Company: ${deck.companyName}
Slide ${body.slideIndex + 1} (type: ${slide.type}):
Title: ${slide.title}
${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
Content: ${slide.content?.join("\n") || ""}

PIQ Score Dimensions:
${dimensionList}

For each dimension relevant to this slide (skip irrelevant ones), provide:
1. A rating: "strong", "needs-work", or "weak"
2. One specific, actionable suggestion

Return ONLY valid JSON:
{
  "feedback": [
    {"dimension": "<id>", "rating": "<strong|needs-work|weak>", "suggestion": "<1 sentence>"}
  ],
  "overallTip": "<1 sentence summary>"
}`;

  const data = await callClaude(apiKey, prompt);
  const text = data.content?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  return NextResponse.json(JSON.parse(jsonMatch[0]));
}

/* ── Rewrite: AI text improvement ────────────────────────────────────── */

async function handleRewrite(
  apiKey: string,
  body: { text: string; context?: string; style?: string }
) {
  const style = body.style || "concise and investor-friendly";
  const prompt = `Rewrite the following text for a pitch deck slide. Make it ${style}. Keep it brief (1-2 sentences max).

${body.context ? `Context: ${body.context}\n` : ""}
Original: "${body.text}"

Return ONLY the rewritten text, nothing else.`;

  const data = await callClaude(apiKey, prompt, 300);
  const rewritten = data.content?.[0]?.text?.trim() || body.text;

  return NextResponse.json({ rewritten });
}

/* ── Investor Lens: Per-slide scoring from 3 personas ────────────────── */

async function handleInvestorLens(
  apiKey: string,
  deck: { slides: string; companyName: string; title: string },
  body: { slideIndex: number }
) {
  const slides = JSON.parse(deck.slides);
  const slide = slides[body.slideIndex];
  if (!slide) {
    return NextResponse.json({ error: "Slide not found" }, { status: 400 });
  }

  const slideContext = `Deck: "${deck.title}" by ${deck.companyName}
Slide ${body.slideIndex + 1} (${slide.type}): ${slide.title}
${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
Content: ${slide.content?.join(" | ") || ""}`;

  const prompt = `You are simulating 3 investor archetypes reviewing a pitch deck slide.

${slideContext}

For each investor type, rate this slide 1-5 stars and give one sentence of feedback:

1. **VC Partner** (Series A focus) — cares about: market size, scalability, competitive moat, unit economics
2. **Angel Investor** (early stage) — cares about: founder vision, problem clarity, early traction, passion
3. **Accelerator Director** (batch selection) — cares about: growth rate, team capability, coachability, market timing

Return ONLY valid JSON:
{
  "evaluations": [
    {"type": "vc", "label": "VC Partner", "stars": <1-5>, "feedback": "<1 sentence>", "suggestion": "<1 sentence improvement>"},
    {"type": "angel", "label": "Angel Investor", "stars": <1-5>, "feedback": "<1 sentence>", "suggestion": "<1 sentence improvement>"},
    {"type": "accelerator", "label": "Accelerator Director", "stars": <1-5>, "feedback": "<1 sentence>", "suggestion": "<1 sentence improvement>"}
  ]
}`;

  const data = await callClaude(apiKey, prompt);
  const text = data.content?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  return NextResponse.json(JSON.parse(jsonMatch[0]));
}

/* ── Simulate: Investor Q&A ──────────────────────────────────────────── */

async function handleSimulate(
  apiKey: string,
  deck: { slides: string; companyName: string; title: string; piqScore: string }
) {
  const slides = JSON.parse(deck.slides);
  let piqContext = "";
  try {
    const piq = JSON.parse(deck.piqScore);
    if (piq.dimensions) {
      const weakDims = piq.dimensions
        .filter((d: { score: number }) => d.score < 70)
        .map((d: { label: string; score: number }) => `${d.label}: ${d.score}/100`)
        .join(", ");
      piqContext = weakDims ? `\nWeakest dimensions: ${weakDims}` : "";
    }
  } catch {
    // No PIQ score available
  }

  const slideSummary = slides
    .map(
      (s: { type: string; title: string; content?: string[] }, i: number) =>
        `Slide ${i + 1} (${s.type}): ${s.title} — ${s.content?.slice(0, 2).join("; ") || ""}`
    )
    .join("\n");

  const prompt = `You are a tough but fair investor evaluating a pitch deck. Generate 5 challenging questions that would expose the weakest parts of this deck.

Deck: "${deck.title}" by ${deck.companyName}${piqContext}

Slides:
${slideSummary}

For each question, identify which slide it targets and suggest how to improve the deck to preemptively address it.

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "<tough investor question>",
      "context": "<why this matters to investors>",
      "targetSlideIndex": <0-based slide index>,
      "suggestedImprovement": "<specific deck change to address this>"
    }
  ]
}`;

  const data = await callClaude(apiKey, prompt, 1500);
  const text = data.content?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  return NextResponse.json(JSON.parse(jsonMatch[0]));
}

/* ── Claude API helper ───────────────────────────────────────────────── */

async function callClaude(
  apiKey: string,
  prompt: string,
  maxTokens = 1000
) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  return res.json();
}
