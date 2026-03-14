import Anthropic from "@anthropic-ai/sdk";
import { BusinessIdea } from "./types";

/** Fixed questions for the idea generator flow (id → label). */
export const IDEA_QUESTIONS: { id: string; label: string; placeholder: string }[] = [
  { id: "skills", label: "What skills or expertise do you have?", placeholder: "e.g. Software, marketing, healthcare, design..." },
  { id: "pain", label: "What problems have you personally experienced or seen in work/life?", placeholder: "e.g. Scheduling is chaotic, invoices get lost..." },
  { id: "audience", label: "Who do you most want to help (customers or users)?", placeholder: "e.g. Small businesses, parents, developers..." },
  { id: "constraints", label: "Any constraints? (time, budget, location)", placeholder: "e.g. Side project, bootstrapped, US only..." },
];

export interface IdeaGeneratorInput {
  answers: { questionId: string; answer: string }[];
}

export async function generateIdeas(input: IdeaGeneratorInput): Promise<BusinessIdea[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateFallbackIdeas(input);
  }

  const client = new Anthropic({ apiKey });
  const answersText = input.answers
    .map((a) => {
      const q = IDEA_QUESTIONS.find((q) => q.id === a.questionId);
      return `${q?.label ?? a.questionId}: ${a.answer}`;
    })
    .join("\n");

  const prompt = `You are a startup idea generator. Based on the following answers from a founder, suggest 3 distinct, viable business ideas. Each idea should be realistic and aligned with their skills, pains, and audience.

Answers:
${answersText}

Return ONLY a valid JSON array of exactly 3 objects. No markdown, no code fences, no explanation.
Each object must have:
- "name": string (short product/company name)
- "oneLiner": string (one sentence pitch)
- "problem": string (1-2 sentences)
- "solution": string (1-2 sentences)
- "targetCustomer": string (who pays / who uses)
- "whyNow": string (optional, why this moment matters)`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as BusinessIdea[];
  } catch {
    return generateFallbackIdeas(input);
  }
}

function generateFallbackIdeas(input: IdeaGeneratorInput): BusinessIdea[] {
  const skills = input.answers.find((a) => a.questionId === "skills")?.answer || "your expertise";
  const audience = input.answers.find((a) => a.questionId === "audience")?.answer || "your target users";
  return [
    {
      name: "Idea 1",
      oneLiner: `A solution that leverages ${skills} to serve ${audience}.`,
      problem: "Based on the pains you described.",
      solution: "A focused product addressing those pains.",
      targetCustomer: audience,
    },
    {
      name: "Idea 2",
      oneLiner: `A platform connecting ${audience} with ${skills}.`,
      problem: "Inefficiency and friction in the current process.",
      solution: "Streamlined workflow and better matching.",
      targetCustomer: audience,
    },
    {
      name: "Idea 3",
      oneLiner: `Tools that help ${audience} do more with less.`,
      problem: "Time and resource constraints.",
      solution: "Automation and smart defaults.",
      targetCustomer: audience,
    },
  ];
}
