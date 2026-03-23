import Anthropic from "@anthropic-ai/sdk";
import type { Skill, IconSelectionOutput } from "../types";

interface IconInput {
  concepts: { concept: string; context: string }[];
}

const ICON_MAP: Record<string, string> = {
  security: "Shield", speed: "Zap", integration: "Plug", analytics: "BarChart3",
  users: "Users", growth: "TrendingUp", money: "DollarSign", time: "Clock",
  cloud: "Cloud", data: "Database", ai: "Brain", automation: "Bot",
  mobile: "Smartphone", web: "Globe", api: "Code", settings: "Settings",
  support: "HeadphonesIcon", team: "Users", scale: "Scale", target: "Target",
  chart: "BarChart3", email: "Mail", notification: "Bell", search: "Search",
  lock: "Lock", key: "Key", star: "Star", heart: "Heart", rocket: "Rocket",
  lightning: "Zap", check: "CheckCircle", warning: "AlertTriangle",
  document: "FileText", folder: "Folder", link: "Link", share: "Share2",
  download: "Download", upload: "Upload", refresh: "RefreshCw", filter: "Filter",
  layers: "Layers", grid: "Grid", list: "List", map: "Map",
  camera: "Camera", image: "Image", video: "Video", mic: "Mic",
  wifi: "Wifi", bluetooth: "Bluetooth", battery: "Battery", cpu: "Cpu",
  monitor: "Monitor", server: "Server", hard_drive: "HardDrive",
  compliance: "ShieldCheck", efficiency: "Gauge", cost: "PiggyBank",
  revenue: "Coins", pipeline: "GitBranch", workflow: "Workflow",
  customer: "UserCheck", retention: "Repeat", acquisition: "UserPlus",
  onboarding: "LogIn", offboarding: "LogOut", dashboard: "LayoutDashboard",
  payment: "CreditCard", invoice: "Receipt", subscription: "RefreshCcw",
  marketplace: "Store", platform: "Boxes", network: "Network",
  health: "Activity", science: "Beaker", education: "GraduationCap",
  environment: "Leaf", energy: "Flame", transport: "Truck",
};

function heuristicMatch(concept: string): string {
  const lower = concept.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return "Sparkles";
}

export const iconSelectorSkill: Skill<IconInput, IconSelectionOutput> = {
  id: "icon-selector",
  name: "Icon Selector",
  category: "visual",
  description: "Selects appropriate Lucide icons for content slides, feature lists, and process steps",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();

    if (!ctx.hasAnthropicKey || input.concepts.length === 0) {
      const icons = input.concepts.map((c) => ({ concept: c.concept, iconName: heuristicMatch(c.concept), context: c.context }));
      return { success: true, data: { icons }, confidence: 0.5, sources: ["Keyword mapping"], durationMs: Date.now() - start, usedFallback: true };
    }

    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const conceptList = input.concepts.map((c) => `"${c.concept}" (context: ${c.context})`).join("\n");
      const res = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        temperature: 0,
        messages: [{
          role: "user",
          content: `Map these concepts to Lucide icon names. Return ONLY a JSON array:
[{ "concept": "string", "iconName": "LucideIconName", "context": "string" }]

Available icons include: ${Object.values(ICON_MAP).slice(0, 40).join(", ")}

Concepts:
${conceptList}`,
        }],
      });
      const text = res.content[0].type === "text" ? res.content[0].text : "";
      const match = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim().match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array");
      const icons = JSON.parse(match[0]) as IconSelectionOutput["icons"];
      return { success: true, data: { icons }, confidence: 0.8, sources: ["AI icon mapping"], durationMs: Date.now() - start, usedFallback: false };
    } catch (err) {
      const icons = input.concepts.map((c) => ({ concept: c.concept, iconName: heuristicMatch(c.concept), context: c.context }));
      return { success: true, data: { icons }, confidence: 0.5, sources: ["Fallback mapping"], durationMs: Date.now() - start, error: String(err), usedFallback: true };
    }
  },
};
