import { NextRequest, NextResponse } from "next/server";
import { IDEA_QUESTIONS } from "@/lib/generate-ideas";

export async function POST(req: NextRequest) {
  try {
    const body: { questionId: string; previousAnswers?: Record<string, string> } = await req.json();

    if (!body.questionId) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    }

    const question = IDEA_QUESTIONS.find((q) => q.id === body.questionId);
    if (!question) {
      return NextResponse.json({ error: "Unknown question" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ suggestion: getFallback(body.questionId) });
    }

    const prevContext = body.previousAnswers
      ? Object.entries(body.previousAnswers)
          .filter(([, v]) => v.trim().length > 0)
          .map(([k, v]) => {
            const q = IDEA_QUESTIONS.find((q) => q.id === k);
            return `${q?.label ?? k}: ${v}`;
          })
          .join("\n")
      : "";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `You are helping a founder brainstorm a startup idea. Generate a realistic, specific example answer for this question:

Question: "${question.label}"
Hint: ${question.hint}
${prevContext ? `\nContext from their other answers:\n${prevContext}` : ""}

Reply with ONLY the example answer text (1-2 sentences). No quotes, no explanation, no preamble. Make it specific and realistic, not generic. ${prevContext ? "Make it consistent with their other answers." : "Pick a random but realistic persona."}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ suggestion: getFallback(body.questionId) });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() || getFallback(body.questionId);
    return NextResponse.json({ suggestion: text });
  } catch (error) {
    console.error("Autofill error:", error);
    return NextResponse.json({ suggestion: getFallback("passion") });
  }
}

function getFallback(questionId: string): string {
  const fallbacks: Record<string, string> = {
    passion: "I love building tools that simplify complex workflows. I spend weekends tinkering with automation scripts and teaching friends how to use no-code tools.",
    frustration: "Managing invoices and chasing payments from clients is a nightmare. I waste hours every month on something that should be automatic.",
    audience: "Freelance consultants and small agency owners who are great at their craft but terrible at the business side of things.",
    advantage: "I've spent 8 years working in operations at a logistics company and understand the supply chain pain points that software hasn't solved yet.",
    model: "SaaS subscriptions",
  };
  return fallbacks[questionId] || "I'm passionate about solving real problems with technology.";
}
