import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/generate-ideas";
import { IdeaQuestionAnswer } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`ideas:${ip}`, { maxRequests: 20, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const body: { answers?: IdeaQuestionAnswer[]; surpriseMe?: boolean } = await req.json();

    if (body.surpriseMe) {
      const ideas = await generateIdeas({ answers: [], surpriseMe: true });
      return NextResponse.json(ideas);
    }

    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json(
        { error: "At least one question answer is required" },
        { status: 400 }
      );
    }

    const ideas = await generateIdeas({ answers: body.answers });
    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Idea generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate business ideas" },
      { status: 500 }
    );
  }
}
