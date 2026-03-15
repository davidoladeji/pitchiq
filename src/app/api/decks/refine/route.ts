import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const FIELD_PROMPTS: Record<string, { role: string; instruction: string }> = {
  problem: {
    role: "startup pitch coach",
    instruction:
      "Refine this problem statement for an investor pitch deck. Make it specific, compelling, and quantify the pain where possible. Keep it to 2-3 sentences max. Write in third person about the target audience, not first person.",
  },
  solution: {
    role: "startup pitch coach",
    instruction:
      "Refine this solution description for an investor pitch deck. Make it clear, specific, and highlight the unique value proposition. Keep it to 2-3 sentences max. Focus on what the product does and why it's different.",
  },
  keyMetrics: {
    role: "startup metrics advisor",
    instruction:
      "Refine these traction/metrics for an investor pitch deck. Make the numbers specific and impressive. If vague, invent plausible early-stage metrics. Format as a comma-separated list of 4-6 key metrics with numbers (e.g. '$12K MRR, 2,400 active users, 89% retention, 3x MoM growth'). Be concise.",
  },
  teamInfo: {
    role: "startup team positioning expert",
    instruction:
      "Refine this team description for an investor pitch deck. Highlight relevant experience, domain expertise, and notable achievements. Format as: Name, Role — one-line bio. Include 2-4 team members. If names aren't provided, keep the roles and strengthen the bios.",
  },
  fundingTarget: {
    role: "fundraising advisor",
    instruction:
      "Refine this funding target for a pitch deck. If it's just a number, add context about what stage this is appropriate for. Keep it very short — e.g. '$1.5M Seed Round' or '$500K Pre-Seed'. One line max.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`deck-refine:${ip}`, { maxRequests: 20, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const body: { field: string; currentValue: string; context?: Record<string, string> } = await req.json();

    if (!body.field || !body.currentValue?.trim()) {
      return NextResponse.json({ error: "field and currentValue are required" }, { status: 400 });
    }

    // Input length validation
    const MAX_LEN = 5000;
    if (body.currentValue.length > MAX_LEN) {
      return NextResponse.json({ error: "currentValue exceeds maximum length" }, { status: 400 });
    }
    if (body.context) {
      for (const [key, val] of Object.entries(body.context)) {
        if (typeof val === 'string' && val.length > MAX_LEN) {
          return NextResponse.json({ error: `context.${key} exceeds maximum length` }, { status: 400 });
        }
      }
    }

    const fieldConfig = FIELD_PROMPTS[body.field];
    if (!fieldConfig) {
      return NextResponse.json({ error: "Unknown field" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ refined: body.currentValue });
    }

    // Build context from other form fields
    const contextLines = body.context
      ? Object.entries(body.context)
          .filter(([k, v]) => k !== body.field && v.trim().length > 0)
          .map(([k, v]) => `${k}: ${v}`)
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
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `You are a ${fieldConfig.role}.

${fieldConfig.instruction}

${contextLines ? `Context about this startup:\n${contextLines}\n` : ""}
The user wrote this rough draft:
"${body.currentValue}"

Reply with ONLY the refined text. No quotes, no explanation, no preamble. Just the improved version.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ refined: body.currentValue });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() || body.currentValue;
    return NextResponse.json({ refined: text });
  } catch (error) {
    console.error("Refine error:", error);
    return NextResponse.json({ refined: "" });
  }
}
