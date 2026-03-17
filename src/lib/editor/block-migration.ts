/**
 * Block Migration — bidirectional conversion between legacy SlideBlock (v1)
 * and the new EditorBlock (v2) format.
 *
 * Used by the editor store to:
 *   1. Convert existing decks on load (v1 → v2)
 *   2. Serialize back to the API on save (v2 → v1)
 *   3. Sync v2 blocks back into SlideData legacy fields for SlideRenderer
 */

import type { SlideBlock, SlideData } from "@/lib/types";
import { migrateSlideToEditor } from "@/lib/editor-utils";
import type {
  BlockType,
  EditorBlock,
  BlocksRecord,
  // BlockPosition used in type annotations below
  BlockStyle,
  TextBlockData,
  HeadingBlockData,
  MetricBlockData,
  ChartBlockData,
  TeamMemberBlockData,
  TimelineItemBlockData,
  QuoteBlockData,
  ImageBlockData,
  LogoGridBlockData,
  ComparisonRowBlockData,
} from "./block-types";
import { defaultPosition, DEFAULT_STYLE } from "./block-defaults";

/* ------------------------------------------------------------------ */
/*  v1 → v2  (load)                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convert a legacy SlideBlock into a typed EditorBlock.
 * Extracts typed data from `content` + `properties`.
 */
export function legacyBlockToEditorBlock(
  block: SlideBlock,
  index: number,
): EditorBlock {
  const pos = defaultPosition(index);
  const style: BlockStyle = { ...DEFAULT_STYLE };
  const base = {
    id: block.id,
    position: pos,
    style,
    locked: false,
    hidden: false,
    animations: [] as EditorBlock["animations"],
  };

  const p = block.properties;

  switch (block.type) {
    case "text": {
      // Detect headings by font size
      const fontSize = (p.fontSize as number) ?? 18;
      if (fontSize >= 28) {
        return {
          ...base,
          type: "heading" as BlockType,
          data: {
            text: block.content || "Heading",
            level: fontSize >= 36 ? 1 : 2,
            align: (p.align as "left" | "center" | "right") ?? "left",
          } as HeadingBlockData,
        } as EditorBlock;
      }
      return {
        ...base,
        type: "text" as BlockType,
        data: {
          text: block.content || "",
          fontSize,
          align: (p.align as "left" | "center" | "right") ?? "left",
          bold: (p.bold as boolean) ?? false,
          italic: (p.italic as boolean) ?? false,
        } as TextBlockData,
      } as EditorBlock;
    }

    case "metric":
      return {
        ...base,
        type: "metric" as BlockType,
        data: {
          label: (p.label as string) ?? block.content ?? "Metric",
          value: (p.value as string) ?? "0",
          change: (p.change as string) ?? undefined,
          trend: (p.trend as "up" | "down" | "neutral") ?? "neutral",
        } as MetricBlockData,
      } as EditorBlock;

    case "chart":
      return {
        ...base,
        type: "chart" as BlockType,
        data: {
          chartType: (p.chartType as ChartBlockData["chartType"]) ?? "bar",
          data: (p.data as ChartBlockData["data"]) ?? [],
          yAxisLabel: (p.yAxisLabel as string) ?? undefined,
        } as ChartBlockData,
      } as EditorBlock;

    case "team-member":
      return {
        ...base,
        type: "team-member" as BlockType,
        data: {
          name: (p.name as string) ?? block.content ?? "Team Member",
          role: (p.role as string) ?? "",
          bio: (p.bio as string) ?? undefined,
          avatarUrl: undefined,
        } as TeamMemberBlockData,
      } as EditorBlock;

    case "timeline-item":
      return {
        ...base,
        type: "timeline-item" as BlockType,
        data: {
          date: (p.date as string) ?? "",
          title: (p.title as string) ?? block.content ?? "Milestone",
          description: (p.description as string) ?? undefined,
          completed: (p.completed as boolean) ?? false,
        } as TimelineItemBlockData,
      } as EditorBlock;

    case "quote":
      return {
        ...base,
        type: "quote" as BlockType,
        data: {
          text: block.content || "Quote text",
          author: (p.attribution as string) ?? (p.author as string) ?? "Author",
          source: (p.source as string) ?? undefined,
        } as QuoteBlockData,
      } as EditorBlock;

    case "image":
      return {
        ...base,
        type: "image" as BlockType,
        data: {
          src: (p.src as string) ?? "",
          alt: (p.alt as string) ?? "Image",
          fit: "contain" as const,
        } as ImageBlockData,
      } as EditorBlock;

    case "logo-grid":
      return {
        ...base,
        type: "logo-grid" as BlockType,
        data: {
          logos: (p.logos as string[]) ?? [],
          columns: (p.columns as number) ?? 4,
        } as LogoGridBlockData,
      } as EditorBlock;

    case "comparison-row":
      return {
        ...base,
        type: "comparison-row" as BlockType,
        data: {
          label: (p.leftLabel as string) ?? (p.label as string) ?? "Feature",
          us: (p.rightLabel as string) ?? (p.us as string) ?? "Us",
          them: (p.them as string) ?? "Them",
        } as ComparisonRowBlockData,
      } as EditorBlock;

    default:
      // Fallback: treat as text
      return {
        ...base,
        type: "text" as BlockType,
        data: {
          text: block.content || "Block",
          fontSize: 16,
          align: "left" as const,
          bold: false,
          italic: false,
        } as TextBlockData,
      } as EditorBlock;
  }
}

/* ------------------------------------------------------------------ */
/*  v2 → v1  (save)                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convert an EditorBlock back to legacy SlideBlock for API persistence.
 */
export function editorBlockToLegacy(block: EditorBlock): SlideBlock {
  switch (block.type) {
    case "text": {
      const d = block.data as TextBlockData;
      return {
        id: block.id,
        type: "text",
        content: d.text,
        properties: { fontSize: d.fontSize, align: d.align, bold: d.bold, italic: d.italic },
      };
    }

    case "heading": {
      const d = block.data as HeadingBlockData;
      return {
        id: block.id,
        type: "text",
        content: d.text,
        properties: { fontSize: d.level === 1 ? 36 : d.level === 2 ? 28 : 22, align: d.align, bold: true, italic: false },
      };
    }

    case "bullet-list": {
      const d = block.data as import("./block-types").BulletListBlockData;
      return {
        id: block.id,
        type: "text",
        content: d.items.join("\n"),
        properties: { fontSize: 16, align: "left", bold: false, italic: false },
      };
    }

    case "callout": {
      const d = block.data as import("./block-types").CalloutBlockData;
      return {
        id: block.id,
        type: "text",
        content: d.text,
        properties: { fontSize: 16, align: "left", bold: false, italic: false },
      };
    }

    case "metric": {
      const d = block.data as MetricBlockData;
      return {
        id: block.id,
        type: "metric",
        content: d.label,
        properties: { value: d.value, label: d.label, change: d.change ?? "", trend: d.trend ?? "neutral" },
      };
    }

    case "chart": {
      const d = block.data as ChartBlockData;
      return {
        id: block.id,
        type: "chart",
        content: "",
        properties: { chartType: d.chartType, data: d.data, yAxisLabel: d.yAxisLabel ?? "" },
      };
    }

    case "team-member": {
      const d = block.data as TeamMemberBlockData;
      return {
        id: block.id,
        type: "team-member",
        content: d.name,
        properties: { name: d.name, role: d.role, bio: d.bio ?? "" },
      };
    }

    case "timeline-item": {
      const d = block.data as TimelineItemBlockData;
      return {
        id: block.id,
        type: "timeline-item",
        content: d.title,
        properties: { date: d.date, title: d.title, description: d.description ?? "", completed: d.completed ?? false },
      };
    }

    case "quote": {
      const d = block.data as QuoteBlockData;
      return {
        id: block.id,
        type: "quote",
        content: d.text,
        properties: { attribution: d.author, source: d.source ?? "" },
      };
    }

    case "image": {
      const d = block.data as ImageBlockData;
      return {
        id: block.id,
        type: "image",
        content: "",
        properties: { src: d.src, alt: d.alt },
      };
    }

    case "logo-grid": {
      const d = block.data as LogoGridBlockData;
      return {
        id: block.id,
        type: "logo-grid",
        content: "",
        properties: { logos: d.logos, columns: d.columns },
      };
    }

    case "comparison-row": {
      const d = block.data as ComparisonRowBlockData;
      return {
        id: block.id,
        type: "comparison-row",
        content: "",
        properties: { label: d.label, us: d.us, them: d.them },
      };
    }

    // Phase 3 data blocks + Phase 1 layout blocks — no legacy equivalent
    case "metric-grid":
    case "funnel":
    case "table":
    case "progress":
    case "divider":
    case "spacer":
    case "shape":
    case "card-group":
    default:
      return {
        id: block.id,
        type: "text",
        content: `[${block.type}]`,
        properties: { _v2Type: block.type, _v2Data: block.data },
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Slide-level migration (load)                                       */
/* ------------------------------------------------------------------ */

/**
 * Migrate a slide's blocks to v2 format, returning a BlocksRecord and order array.
 * Priority: editorBlocksV2 → editorBlocks (v1) → build from legacy fields.
 */
export function migrateSlideToV2(
  slide: SlideData,
): { blocks: BlocksRecord; order: string[] } {
  // Already v2? (runtime field)
  const v2 = (slide as unknown as Record<string, unknown>).editorBlocksV2 as BlocksRecord | undefined;
  if (v2 && Object.keys(v2).length > 0) {
    return { blocks: v2, order: Object.keys(v2) };
  }

  // Has v1 editorBlocks? Convert each.
  if (slide.editorBlocks && slide.editorBlocks.length > 0) {
    const blocks: BlocksRecord = {};
    const order: string[] = [];
    slide.editorBlocks.forEach((b, i) => {
      const eb = legacyBlockToEditorBlock(b, i);
      blocks[eb.id] = eb;
      order.push(eb.id);
    });
    return { blocks, order };
  }

  // Neither — use existing migrateSlideToEditor to build v1 blocks, then convert
  const migrated = migrateSlideToEditor(slide);
  if (migrated.editorBlocks && migrated.editorBlocks.length > 0) {
    const blocks: BlocksRecord = {};
    const order: string[] = [];
    migrated.editorBlocks.forEach((b, i) => {
      const eb = legacyBlockToEditorBlock(b, i);
      blocks[eb.id] = eb;
      order.push(eb.id);
    });
    return { blocks, order };
  }

  return { blocks: {}, order: [] };
}

/* ------------------------------------------------------------------ */
/*  Sync blocks back into SlideData for SlideRenderer compatibility    */
/* ------------------------------------------------------------------ */

/**
 * Write v2 EditorBlocks back into a slide's legacy fields so SlideRenderer
 * can render them without any changes. Called before save.
 */
export function syncBlocksToSlideData(
  slide: SlideData,
  blocks: EditorBlock[],
): SlideData {
  const updated = { ...slide };

  // Convert all blocks to legacy format
  updated.editorBlocks = blocks.map(editorBlockToLegacy);

  // Sync structured fields used by SlideRenderer
  const metrics = blocks.filter((b) => b.type === "metric");
  if (metrics.length > 0) {
    updated.metrics = metrics.map((b) => {
      const d = b.data as MetricBlockData;
      return { label: d.label, value: d.value, change: d.change, trend: d.trend };
    });
  }

  const team = blocks.filter((b) => b.type === "team-member");
  if (team.length > 0) {
    updated.team = team.map((b) => {
      const d = b.data as TeamMemberBlockData;
      return { name: d.name, role: d.role, bio: d.bio };
    });
  }

  const timeline = blocks.filter((b) => b.type === "timeline-item");
  if (timeline.length > 0) {
    updated.timeline = timeline.map((b) => {
      const d = b.data as TimelineItemBlockData;
      return { date: d.date, title: d.title, description: d.description, completed: d.completed };
    });
  }

  const chart = blocks.find((b) => b.type === "chart");
  if (chart) {
    const d = chart.data as ChartBlockData;
    // Cast chartType to legacy — SlideRenderer only knows bar/pie/line/area
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updated.chartData = { type: d.chartType as any, data: d.data, label: d.yAxisLabel };
  }

  // Text content for simple renderers
  const texts = blocks.filter((b) => b.type === "text" || b.type === "heading" || b.type === "bullet-list");
  if (texts.length > 0) {
    updated.content = texts.flatMap((b) => {
      if (b.type === "bullet-list") {
        return (b.data as import("./block-types").BulletListBlockData).items;
      }
      return [(b.data as TextBlockData | HeadingBlockData).text];
    });
  }

  // Strip runtime-only field
  delete (updated as Record<string, unknown>).editorBlocksV2;

  return updated;
}
