import Anthropic from "@anthropic-ai/sdk";
import { BusinessIdea } from "./types";

/** Questions for the idea generator flow. */
export const IDEA_QUESTIONS: { id: string; label: string; hint: string; placeholder: string }[] = [
  {
    id: "passion",
    label: "What do you enjoy doing so much you'd do it for free?",
    hint: "Think hobbies, side projects, or skills people always ask you about.",
    placeholder: "e.g. Teaching people to code, organizing events, analyzing data...",
  },
  {
    id: "frustration",
    label: "What's something broken that frustrates you every week?",
    hint: "The best startups fix problems founders experience firsthand.",
    placeholder: "e.g. Expense reports are painful, finding a good dentist is impossible...",
  },
  {
    id: "audience",
    label: "Who would you love to build something for?",
    hint: "Be specific \u2014 a niche audience is better than 'everyone'.",
    placeholder: "e.g. Freelance designers, first-time parents, restaurant owners...",
  },
  {
    id: "advantage",
    label: "What unique insight or access do you have that others don't?",
    hint: "Industry connections, domain expertise, a dataset, lived experience...",
    placeholder: "e.g. 10 years in logistics, access to university networks...",
  },
  {
    id: "model",
    label: "How would you prefer to make money?",
    hint: "This shapes the kind of business we suggest.",
    placeholder: "e.g. SaaS subscriptions, marketplace fees, consulting, ads...",
  },
];

/** Random surprise-me themes for generating ideas without answering questions. */
const SURPRISE_THEMES = [
  "AI tools for creative professionals",
  "Developer productivity and workflow",
  "Health and wellness for remote workers",
  "Fintech for underserved communities",
  "Climate tech and sustainability",
  "Education technology for adults",
  "Local community and small business tools",
  "Creator economy and monetization",
  "Pet care and animal wellness",
  "Food supply chain and restaurant tech",
  "Mental health and emotional wellbeing",
  "Real estate and property management",
  "Legal tech simplification",
  "E-commerce for niche markets",
  "Sports analytics and fan engagement",
  "Travel and hospitality innovation",
  "HR and people operations",
  "Cybersecurity for small businesses",
  "Social impact and nonprofit tech",
  "Parenting and childcare solutions",
];

export interface IdeaGeneratorInput {
  answers: { questionId: string; answer: string }[];
  surpriseMe?: boolean;
}

export async function generateIdeas(input: IdeaGeneratorInput): Promise<BusinessIdea[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return input.surpriseMe ? generateSurpriseFallback() : generateFallbackIdeas(input);
  }

  const client = new Anthropic({ apiKey });

  let prompt: string;

  if (input.surpriseMe) {
    const theme1 = SURPRISE_THEMES[Math.floor(Math.random() * SURPRISE_THEMES.length)];
    let theme2 = SURPRISE_THEMES[Math.floor(Math.random() * SURPRISE_THEMES.length)];
    while (theme2 === theme1) theme2 = SURPRISE_THEMES[Math.floor(Math.random() * SURPRISE_THEMES.length)];

    prompt = `You are a creative startup idea generator. Generate 3 surprising, original, and viable business ideas. Mix these themes for inspiration: "${theme1}" and "${theme2}". The ideas should be unexpected combinations that a founder would get excited about.

Return ONLY a valid JSON array of exactly 3 objects. No markdown, no code fences, no explanation.
Each object must have:
- "name": string (catchy product/company name)
- "oneLiner": string (one sentence pitch)
- "problem": string (1-2 sentences about the pain point)
- "solution": string (1-2 sentences about how the product solves it)
- "targetCustomer": string (who pays / who uses)
- "whyNow": string (why this moment in time matters for this idea)`;
  } else {
    const answersText = input.answers
      .map((a) => {
        const q = IDEA_QUESTIONS.find((q) => q.id === a.questionId);
        return `${q?.label ?? a.questionId}: ${a.answer}`;
      })
      .join("\n");

    prompt = `You are a startup idea generator. Based on the following answers from a founder, suggest 3 distinct, viable business ideas. Each idea should be realistic, specific, and aligned with their passions, frustrations, audience, and advantages. Be creative \u2014 don't suggest generic ideas.

Founder's answers:
${answersText}

Return ONLY a valid JSON array of exactly 3 objects. No markdown, no code fences, no explanation.
Each object must have:
- "name": string (catchy product/company name)
- "oneLiner": string (one sentence pitch)
- "problem": string (1-2 sentences about the pain point)
- "solution": string (1-2 sentences about how the product solves it)
- "targetCustomer": string (who pays / who uses)
- "whyNow": string (why this moment in time matters for this idea)`;
  }

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
    return input.surpriseMe ? generateSurpriseFallback() : generateFallbackIdeas(input);
  }
}

function generateSurpriseFallback(): BusinessIdea[] {
  return [
    {
      name: "PetPulse",
      oneLiner: "AI-powered health monitoring for pet owners who want peace of mind.",
      problem: "Pet owners can't tell when something's wrong until it's too late. Vet visits are expensive and reactive.",
      solution: "A smart collar + app that tracks activity, sleep, and behavioral patterns to flag health issues early.",
      targetCustomer: "Dog and cat owners aged 25-45 in urban areas",
      whyNow: "Wearable sensor costs have dropped 80% and pet spending is at an all-time high.",
    },
    {
      name: "ShelfLife",
      oneLiner: "Reduce food waste for restaurants by predicting exactly what they'll need.",
      problem: "Restaurants throw away 4-10% of purchased food. Ordering is based on gut feel, not data.",
      solution: "ML-based demand forecasting that integrates with POS systems to auto-generate optimized orders.",
      targetCustomer: "Independent restaurants and small chains (10-50 locations)",
      whyNow: "Rising food costs and new waste regulations are forcing restaurants to get smarter about inventory.",
    },
    {
      name: "SkillSwap",
      oneLiner: "A marketplace where freelancers trade services instead of paying cash.",
      problem: "Freelancers need design, legal, accounting help but can't always afford to pay for it.",
      solution: "Time-banked service exchange with reputation scores and skill matching.",
      targetCustomer: "Freelancers and solopreneurs in the first 2 years of their business",
      whyNow: "The freelance economy has doubled since 2020 and cash flow is the #1 challenge.",
    },
  ];
}

function generateFallbackIdeas(input: IdeaGeneratorInput): BusinessIdea[] {
  const passion = input.answers.find((a) => a.questionId === "passion")?.answer || "your expertise";
  const audience = input.answers.find((a) => a.questionId === "audience")?.answer || "your target users";
  const frustration = input.answers.find((a) => a.questionId === "frustration")?.answer || "common pain points";
  return [
    {
      name: "SolveIt",
      oneLiner: `A tool that helps ${audience} overcome ${frustration}.`,
      problem: `${audience} struggle with ${frustration} and current solutions are inadequate.`,
      solution: `A focused product leveraging ${passion} to directly address this gap.`,
      targetCustomer: audience,
      whyNow: "Market timing is favorable as demand for solutions in this space is growing.",
    },
    {
      name: "ConnectHub",
      oneLiner: `A platform connecting ${audience} with experts in ${passion}.`,
      problem: "Finding the right expertise is time-consuming and expensive.",
      solution: "AI-matched connections with transparent pricing and quality guarantees.",
      targetCustomer: audience,
      whyNow: "Remote work has made geography irrelevant for service delivery.",
    },
    {
      name: "AutoFlow",
      oneLiner: `Automation tools that help ${audience} save hours every week.`,
      problem: `${frustration} wastes time that could be spent on high-value work.`,
      solution: "Smart automation with simple setup that handles the tedious parts.",
      targetCustomer: audience,
      whyNow: "AI capabilities now make previously complex automation accessible to everyone.",
    },
  ];
}
