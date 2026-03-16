import { nanoid } from "nanoid";
import type {
  SlideData,
  SlideBlock,
  SlideBlockType,
  ChartDataPoint,
} from "@/lib/types";

/**
 * Create a SlideBlock with sensible defaults for each block type.
 */
export function createDefaultBlock(type: SlideBlockType): SlideBlock {
  const id = nanoid(10);

  switch (type) {
    case "text":
      return {
        id,
        type: "text",
        content: "Enter your text here...",
        properties: { fontSize: 18, align: "left", bold: false, italic: false },
      };

    case "metric":
      return {
        id,
        type: "metric",
        content: "New Metric",
        properties: {
          value: "0",
          label: "Metric Label",
          change: "+0%",
          trend: "neutral" as const,
        },
      };

    case "chart":
      return {
        id,
        type: "chart",
        content: "Chart Title",
        properties: {
          chartType: "bar" as const,
          data: [
            { label: "Q1", value: 40 },
            { label: "Q2", value: 65 },
            { label: "Q3", value: 50 },
            { label: "Q4", value: 80 },
          ] as ChartDataPoint[],
          yAxisLabel: "Revenue ($K)",
        },
      };

    case "team-member":
      return {
        id,
        type: "team-member",
        content: "Team Member",
        properties: {
          name: "Jane Doe",
          role: "CEO & Co-founder",
          bio: "10+ years of industry experience.",
        },
      };

    case "timeline-item":
      return {
        id,
        type: "timeline-item",
        content: "Milestone",
        properties: {
          date: "Q1 2026",
          title: "New Milestone",
          description: "Description of this milestone.",
          completed: false,
        },
      };

    case "image":
      return {
        id,
        type: "image",
        content: "",
        properties: {
          src: "",
          alt: "Image placeholder",
          width: "100%",
          height: 300,
        },
      };

    case "quote":
      return {
        id,
        type: "quote",
        content: '"Your inspiring quote here."',
        properties: {
          attribution: "— Author Name",
          fontSize: 24,
        },
      };

    case "logo-grid":
      return {
        id,
        type: "logo-grid",
        content: "Our Partners",
        properties: {
          logos: ["Partner A", "Partner B", "Partner C", "Partner D"],
          columns: 4,
        },
      };

    case "comparison-row":
      return {
        id,
        type: "comparison-row",
        content: "Feature comparison",
        properties: {
          leftLabel: "Before",
          rightLabel: "After",
          leftItems: ["Manual process", "Slow turnaround"],
          rightItems: ["Automated workflow", "Instant results"],
        },
      };

    default: {
      const _exhaustive: never = type; // eslint-disable-line @typescript-eslint/no-unused-vars
      return {
        id,
        type: "text",
        content: "New block",
        properties: {},
      };
    }
  }
}

/**
 * Convert a slide's `content[]` into structured `editorBlocks[]`.
 * Preserves any existing editorBlocks. Also migrates metrics, team, timeline, and chartData.
 */
export function migrateSlideToEditor(slide: SlideData): SlideData {
  if (slide.editorBlocks && slide.editorBlocks.length > 0) {
    return { ...slide, id: slide.id || nanoid(10) };
  }

  const blocks: SlideBlock[] = [];

  // Migrate structured data first
  if (slide.metrics && slide.metrics.length > 0) {
    for (const m of slide.metrics) {
      blocks.push({
        id: nanoid(10),
        type: "metric",
        content: m.label,
        properties: {
          value: m.value,
          label: m.label,
          change: m.change || "",
          trend: m.trend || "neutral",
        },
      });
    }
  } else if (slide.team && slide.team.length > 0) {
    for (const t of slide.team) {
      blocks.push({
        id: nanoid(10),
        type: "team-member",
        content: t.name,
        properties: {
          name: t.name,
          role: t.role,
          bio: t.bio || "",
        },
      });
    }
  } else if (slide.timeline && slide.timeline.length > 0) {
    for (const tl of slide.timeline) {
      blocks.push({
        id: nanoid(10),
        type: "timeline-item",
        content: tl.title,
        properties: {
          date: tl.date,
          title: tl.title,
          description: tl.description || "",
          completed: tl.completed || false,
        },
      });
    }
  } else if (slide.chartData) {
    blocks.push({
      id: nanoid(10),
      type: "chart",
      content: slide.title,
      properties: {
        chartType: slide.chartData.type,
        data: slide.chartData.data,
        yAxisLabel: slide.chartData.label || "",
      },
    });
  } else {
    // Fallback: convert content strings to text blocks
    for (const text of slide.content) {
      blocks.push({
        id: nanoid(10),
        type: "text",
        content: text,
        properties: { fontSize: 18, align: "left", bold: false, italic: false },
      });
    }
  }

  return {
    ...slide,
    id: slide.id || nanoid(10),
    editorBlocks: blocks,
  };
}

/**
 * Create a new empty slide of the given type with sensible defaults.
 */
export function createDefaultSlide(type: SlideData["type"]): SlideData {
  const id = nanoid(10);

  const base: SlideData = {
    id,
    title: "",
    subtitle: "",
    content: [],
    type,
  };

  switch (type) {
    case "title":
      return {
        ...base,
        title: "Your Title Here",
        subtitle: "A compelling subtitle",
        content: ["Key point or tagline"],
      };

    case "content":
      return {
        ...base,
        title: "Section Title",
        subtitle: "Supporting context",
        content: [
          "First key point",
          "Second key point",
          "Third key point",
        ],
        layout: "default",
      };

    case "stats":
      return {
        ...base,
        title: "Key Statistics",
        subtitle: "Numbers that matter",
        content: ["$10M ARR", "500K+ Users", "95% Retention", "3x YoY Growth"],
        accent: true,
      };

    case "comparison":
      return {
        ...base,
        title: "Why Us",
        subtitle: "How we compare",
        content: [
          "10x faster than legacy solutions",
          "50% lower cost",
          "Enterprise-grade security",
        ],
      };

    case "cta":
      return {
        ...base,
        title: "Let's Build the Future Together",
        subtitle: "Get in touch to learn more",
        content: ["hello@example.com", "www.example.com"],
      };

    case "chart":
      return {
        ...base,
        title: "Growth Trajectory",
        subtitle: "Revenue over time",
        content: [],
        chartData: {
          type: "bar",
          data: [
            { label: "Q1", value: 40 },
            { label: "Q2", value: 65 },
            { label: "Q3", value: 80 },
            { label: "Q4", value: 120 },
          ],
          label: "Revenue ($K)",
        },
        accent: true,
      };

    case "metrics":
      return {
        ...base,
        title: "Key Metrics",
        subtitle: "Our performance at a glance",
        content: [],
        metrics: [
          { label: "Revenue", value: "$2.4M", change: "+124%", trend: "up" },
          { label: "Users", value: "50K", change: "+89%", trend: "up" },
          { label: "Retention", value: "95%", change: "+3%", trend: "up" },
          { label: "NPS", value: "72", change: "+12", trend: "up" },
        ],
        accent: true,
      };

    case "team":
      return {
        ...base,
        title: "Our Team",
        subtitle: "The people behind the product",
        content: [],
        team: [
          { name: "Jane Doe", role: "CEO", bio: "Former VP at TechCorp" },
          { name: "John Smith", role: "CTO", bio: "Ex-Google engineer" },
          { name: "Alice Chen", role: "CPO", bio: "Stanford MBA" },
        ],
      };

    case "timeline":
      return {
        ...base,
        title: "Roadmap",
        subtitle: "Our journey ahead",
        content: [],
        timeline: [
          { date: "Q1 2026", title: "Beta Launch", description: "Initial release", completed: true },
          { date: "Q2 2026", title: "Product-Market Fit", description: "1K paying customers" },
          { date: "Q4 2026", title: "Series A", description: "Scale operations" },
        ],
      };

    case "image-content":
      return {
        ...base,
        title: "Visual Overview",
        subtitle: "",
        content: ["Description of the visual content"],
        imagePrompt: "A modern product screenshot",
      };

    default:
      return base;
  }
}
