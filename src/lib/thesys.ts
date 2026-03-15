/**
 * Thesys API integration for generating visual content (charts, images).
 * Uses the Thesys Visualize endpoint for chart data generation.
 */

interface ThesysMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ThesysResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

export async function callThesys(messages: ThesysMessage[]): Promise<string> {
  const apiKey = process.env.THESYS_API_KEY;
  if (!apiKey) return "";

  const res = await fetch("https://api.thesys.dev/v1/embed/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "c1/anthropic/claude-sonnet-4/v-20251230",
      messages,
      stream: false,
    }),
  });

  if (!res.ok) return "";

  const data: ThesysResponse = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Generate chart data for a specific slide topic using Thesys.
 */
export async function generateChartData(
  topic: string,
  companyName: string,
  industry: string
): Promise<{ type: "bar" | "pie" | "line" | "area"; data: { label: string; value: number }[]; label: string } | null> {
  const apiKey = process.env.THESYS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.thesys.dev/v1/embed/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "c1/anthropic/claude-sonnet-4/v-20251230",
        messages: [
          {
            role: "user",
            content: `Generate realistic chart data for a ${industry} startup called "${companyName}".
Topic: ${topic}

Return ONLY valid JSON with this structure:
{
  "type": "bar" or "pie" or "line" or "area",
  "data": [{"label": "string", "value": number}, ...],
  "label": "Y-axis label or chart description"
}

Use 4-7 data points. Make the numbers realistic for a startup pitch deck. Pick the chart type that best visualizes this topic.`,
          },
        ],
        stream: false,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}
