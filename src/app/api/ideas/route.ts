import { NextRequest, NextResponse } from "next/server";
import { generateIdeas } from "@/lib/generate-ideas";
import { IdeaQuestionAnswer } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
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
