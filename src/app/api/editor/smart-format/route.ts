import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

/**
 * POST /api/editor/smart-format
 * Smart Block: Auto-detect content type and return formatted block data.
 *
 * Accepts raw text and returns the best block type + structured properties.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  // Try heuristic detection first (no API call needed for obvious patterns)
  const heuristicResult = detectBlockType(text);
  if (heuristicResult) {
    return NextResponse.json(heuristicResult);
  }

  // Fall back to AI detection if API key is available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const aiResult = await aiDetectBlockType(apiKey, text);
      return NextResponse.json(aiResult);
    } catch {
      // Fall through to default text block
    }
  }

  // Default: treat as text block
  return NextResponse.json({
    type: "text",
    content: text,
    properties: {},
  });
}

/* ── Heuristic block type detection ──────────────────────────────────── */

interface DetectedBlock {
  type: string;
  content: string;
  properties: Record<string, unknown>;
}

function detectBlockType(text: string): DetectedBlock | null {
  const trimmed = text.trim();

  // Metric detection: numbers with $ or % or growth indicators
  const metricPattern =
    /^[\$€£]?\s*[\d,.]+[KkMmBb]?\s*[\+\-]?\s*(?:[\%]|ARR|MRR|revenue|users|customers)?/i;
  if (metricPattern.test(trimmed) && trimmed.length < 100) {
    const parts = trimmed.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 4) {
      const metrics = parts.map((part) => {
        const numMatch = part.match(/([\$€£]?\s*[\d,.]+[KkMmBb]?\s*%?)/);
        const value = numMatch ? numMatch[1].trim() : part;
        const label = part.replace(value, "").trim() || "Metric";
        const changeMatch = part.match(/([+-]\s*[\d,.]+\s*%)/);
        return {
          label,
          value,
          change: changeMatch ? changeMatch[1] : undefined,
          trend: changeMatch
            ? changeMatch[1].startsWith("+")
              ? "up"
              : "down"
            : "neutral",
        };
      });
      return {
        type: "metric",
        content: trimmed,
        properties: { metrics },
      };
    }
  }

  // Team detection: name + role patterns (e.g., "John Doe, CEO")
  const teamPattern = /^[\w\s]+[,\-–—]\s*(?:CEO|CTO|COO|CFO|VP|Director|Head|Lead|Founder|Engineer|Designer)/im;
  if (teamPattern.test(trimmed)) {
    const lines = trimmed.split(/[\n]+/).map((s) => s.trim()).filter(Boolean);
    const members = lines.map((line) => {
      const [name, ...rest] = line.split(/[,\-–—]/);
      return {
        name: name?.trim() || "Name",
        role: rest.join(",").trim() || "Role",
        bio: "",
      };
    });
    return {
      type: "team-member",
      content: trimmed,
      properties: { team: members },
    };
  }

  // Timeline detection: dates/quarters/years followed by descriptions
  const timelinePattern = /^(?:Q[1-4]|20\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/im;
  if (timelinePattern.test(trimmed)) {
    const lines = trimmed.split(/[\n]+/).map((s) => s.trim()).filter(Boolean);
    const items = lines.map((line) => {
      const dateMatch = line.match(/^(Q[1-4]\s*20\d{2}|20\d{2}|[A-Z][a-z]+\s*20\d{2})/);
      return {
        date: dateMatch ? dateMatch[1] : "",
        title: dateMatch ? line.replace(dateMatch[1], "").replace(/^[\s\-–—:]+/, "").trim() : line,
        description: "",
        completed: false,
      };
    });
    return {
      type: "timeline-item",
      content: trimmed,
      properties: { timeline: items },
    };
  }

  // Quote detection: starts with " or contains attribution
  if (
    trimmed.startsWith('"') ||
    trimmed.startsWith("\u201C") ||
    /\s*[-–—]\s*[A-Z][\w\s]+$/.test(trimmed)
  ) {
    return {
      type: "quote",
      content: trimmed.replace(/^[""\u201C]+|[""\u201D]+$/g, ""),
      properties: {
        attribution: trimmed.match(/[-–—]\s*(.+)$/)?.[1] || "",
      },
    };
  }

  // Chart data detection: table-like data with numbers
  const lines = trimmed.split(/[\n]+/).filter(Boolean);
  if (lines.length >= 3 && lines.every((l) => /\d/.test(l))) {
    const data = lines
      .map((l) => {
        const parts = l.split(/[\t,|]+/).map((s) => s.trim());
        if (parts.length >= 2) {
          return { label: parts[0], value: parseFloat(parts[1]) || 0 };
        }
        return null;
      })
      .filter(Boolean);

    if (data.length >= 2) {
      return {
        type: "chart",
        content: trimmed,
        properties: {
          chartData: {
            type: "bar",
            data,
            label: "Value",
          },
        },
      };
    }
  }

  return null; // No pattern matched
}

/* ── AI-powered block type detection ─────────────────────────────────── */

async function aiDetectBlockType(
  apiKey: string,
  text: string
): Promise<DetectedBlock> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Classify this text for a pitch deck slide block. Return the best block type and formatted properties.

Text: "${text.slice(0, 500)}"

Block types: text, metric, chart, team-member, timeline-item, quote, logo-grid, comparison-row

Return ONLY valid JSON:
{"type": "<block_type>", "content": "<cleaned text>", "properties": {<type-specific data>}}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error("AI detection failed");

  const data = await res.json();
  const responseText = data.content?.[0]?.text || "";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");

  return JSON.parse(jsonMatch[0]);
}
