import type { SlideData } from "@/lib/types";
import type {
  BlocksRecord,
  EditorBlock,
  TextBlockData,
  HeadingBlockData,
  BulletListBlockData,
  MetricBlockData,
  ChartBlockData,
  ComparisonRowBlockData,
  TeamMemberBlockData,
  TimelineItemBlockData,
  QuoteBlockData,
  CalloutBlockData,
  CardGroupBlockData,
  TableBlockData,
  ImageBlockData,
  DividerBlockData,
} from "@/lib/editor/block-types";
import { getTheme } from "@/lib/themes";

/** Strip '#' prefix from hex colors (pptxgenjs requires bare hex). */
function stripHash(color: string): string {
  return color.replace("#", "");
}

/** Convert grid x (12-col) to inches on a 10" wide slide. */
function toX(gridX: number): number {
  return (gridX / 12) * 10;
}

/** Convert grid y (6-row) to inches on a 5.625" tall slide. */
function toY(gridY: number): number {
  return (gridY / 6) * 5.625;
}

/** Convert grid width (12-col) to inches. */
function toW(gridW: number): number {
  return (gridW / 12) * 10;
}

/** Convert grid height (6-row) to inches. */
function toH(gridH: number): number {
  return (gridH / 6) * 5.625;
}

/** Map callout variant to a background fill color. */
function calloutBgColor(variant: string): string {
  switch (variant) {
    case "info":
      return "DBEAFE";
    case "warning":
      return "FEF3C7";
    case "success":
      return "D1FAE5";
    case "tip":
      return "EDE9FE";
    default:
      return "F3F4F6";
  }
}

/** Determine whether a slide should use the dark background. */
function isDarkBg(slide: SlideData): boolean {
  return slide.type === "title" || slide.type === "cta" || slide.accent === true;
}

export async function exportPptx(opts: {
  slides: SlideData[];
  slideBlocks: Record<string, BlocksRecord>;
  slideBlockOrder: Record<string, string[]>;
  themeId: string;
  deckTitle: string;
  companyName: string;
}): Promise<void> {
  const { slides, slideBlocks, slideBlockOrder, themeId, deckTitle } = opts;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PptxGenJS = (await import(/* webpackIgnore: true */ "pptxgenjs" as any)).default;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pptx: any = new PptxGenJS();
  pptx.defineLayout({ name: "LAYOUT_16x9", width: 10, height: 5.625 });
  pptx.layout = "LAYOUT_16x9";

  const theme = getTheme(themeId);

  for (const slideData of slides) {
    const slideId = slideData.id ?? "";
    const pptxSlide = pptx.addSlide();

    // Background
    const dark = isDarkBg(slideData);
    const bgColor = dark ? theme.bgDark : theme.bgLight;
    pptxSlide.background = { color: stripHash(bgColor) };

    const blockOrder = slideBlockOrder[slideId];
    const blocks = slideBlocks[slideId];

    // Check if this slide has v2 blocks
    if (blockOrder && blockOrder.length > 0 && blocks) {
      for (const blockId of blockOrder) {
        const block: EditorBlock | undefined = blocks[blockId];
        if (!block || block.hidden) continue;

        const pos = block.position;
        const x = toX(pos.x);
        const y = toY(pos.y);
        const w = toW(pos.width);
        const h = toH(pos.height);
        const textColor = dark ? stripHash(theme.textPrimary) : stripHash(theme.textOnLight);

        switch (block.type) {
          case "text": {
            const data = block.data as TextBlockData;
            pptxSlide.addText(data.text || "", {
              x,
              y,
              w,
              h,
              fontSize: data.fontSize || 14,
              bold: data.bold || false,
              italic: data.italic || false,
              align: data.align || "left",
              color: textColor,
              fontFace: theme.fontFamily,
            });
            break;
          }

          case "heading": {
            const data = block.data as HeadingBlockData;
            const level = data.level || 1;
            const fontSize = level === 1 ? 36 : level === 2 ? 28 : 22;
            pptxSlide.addText(data.text || "", {
              x,
              y,
              w,
              h,
              fontSize,
              bold: true,
              align: data.align || "left",
              color: textColor,
              fontFace: theme.headingFont,
            });
            break;
          }

          case "bullet-list": {
            const data = block.data as BulletListBlockData;
            const items = data.items || [];
            pptxSlide.addText(
              items.map((item) => ({ text: item, options: { bullet: true } })),
              { x, y, w, h, fontSize: 14, color: textColor, fontFace: theme.fontFamily }
            );
            break;
          }

          case "quote": {
            const data = block.data as QuoteBlockData;
            const parts: { text: string; options: Record<string, unknown> }[] = [];
            if (data.text) {
              parts.push({
                text: `\u201C${data.text}\u201D`,
                options: { italic: true, fontSize: 18, color: textColor },
              });
            }
            if (data.author) {
              parts.push({
                text: `\n\u2014 ${data.author}`,
                options: { fontSize: 12, color: "888888" },
              });
            }
            if (parts.length > 0) {
              pptxSlide.addText(parts, { x, y, w, h, fontFace: theme.fontFamily });
            }
            break;
          }

          case "callout": {
            const data = block.data as CalloutBlockData;
            pptxSlide.addText(data.text || "", {
              x,
              y,
              w,
              h,
              fontSize: 14,
              color: textColor,
              fontFace: theme.fontFamily,
              fill: { color: calloutBgColor(data.variant) },
            });
            break;
          }

          case "metric": {
            const data = block.data as MetricBlockData;
            const parts: { text: string; options: Record<string, unknown> }[] = [];
            const valueStr = `${data.prefix || ""}${data.value || ""}${data.suffix || ""}`;
            parts.push({
              text: valueStr,
              options: { fontSize: 36, bold: true, color: stripHash(theme.accent) },
            });
            if (data.label) {
              parts.push({
                text: `\n${data.label}`,
                options: { fontSize: 12, color: textColor },
              });
            }
            if (data.change) {
              const changeColor =
                data.trend === "up" ? "22C55E" : data.trend === "down" ? "EF4444" : "888888";
              parts.push({
                text: `  ${data.change}`,
                options: { fontSize: 12, color: changeColor },
              });
            }
            pptxSlide.addText(parts, { x, y, w, h, fontFace: theme.fontFamily });
            break;
          }

          case "chart": {
            const data = block.data as ChartBlockData;
            const chartItems = data.data || [];
            if (chartItems.length === 0) break;

            const chartTypeStr = data.chartType || "bar";
            let pptxChartType: string;
            if (chartTypeStr === "line") pptxChartType = pptx.charts.LINE;
            else if (chartTypeStr === "pie" || chartTypeStr === "donut")
              pptxChartType = pptx.charts.PIE;
            else if (chartTypeStr === "area" || chartTypeStr === "area-stacked")
              pptxChartType = pptx.charts.AREA;
            else pptxChartType = pptx.charts.BAR;

            const chartData = [
              {
                name: "Series",
                labels: chartItems.map((d) => d.label),
                values: chartItems.map((d) => d.value),
              },
            ];

            pptxSlide.addChart(pptxChartType, chartData, {
              x,
              y,
              w,
              h,
              showLegend: data.showLegend ?? false,
            });
            break;
          }

          case "comparison-row": {
            const data = block.data as ComparisonRowBlockData;
            const rows = [
              [
                { text: "Feature", options: { bold: true, color: textColor, fill: { color: stripHash(theme.accent) } } },
                { text: "Us", options: { bold: true, color: textColor, fill: { color: stripHash(theme.accent) } } },
                { text: "Them", options: { bold: true, color: textColor, fill: { color: stripHash(theme.accent) } } },
              ],
              [
                { text: data.label || "", options: { color: textColor } },
                { text: data.us || "", options: { color: textColor } },
                { text: data.them || "", options: { color: textColor } },
              ],
            ];
            pptxSlide.addTable(rows, { x, y, w, h, fontSize: 12, fontFace: theme.fontFamily });
            break;
          }

          case "team-member": {
            const data = block.data as TeamMemberBlockData;
            const parts: { text: string; options: Record<string, unknown> }[] = [];
            if (data.name) {
              parts.push({ text: data.name, options: { bold: true, fontSize: 16, color: textColor } });
            }
            if (data.role) {
              parts.push({ text: `\n${data.role}`, options: { fontSize: 12, color: textColor } });
            }
            if (data.bio) {
              parts.push({ text: `\n${data.bio}`, options: { fontSize: 11, color: "888888" } });
            }
            if (parts.length > 0) {
              pptxSlide.addText(parts, { x, y, w, h, fontFace: theme.fontFamily });
            }
            break;
          }

          case "timeline-item": {
            const data = block.data as TimelineItemBlockData;
            const parts: { text: string; options: Record<string, unknown> }[] = [];
            if (data.date) {
              parts.push({
                text: data.date,
                options: { fontSize: 10, color: stripHash(theme.accent) },
              });
            }
            if (data.title) {
              parts.push({
                text: `\n${data.title}`,
                options: { fontSize: 14, bold: true, color: textColor },
              });
            }
            if (data.description) {
              parts.push({
                text: `\n${data.description}`,
                options: { fontSize: 11, color: "888888" },
              });
            }
            if (parts.length > 0) {
              pptxSlide.addText(parts, { x, y, w, h, fontFace: theme.fontFamily });
            }
            break;
          }

          case "table": {
            const data = block.data as TableBlockData;
            const columns = data.columns || [];
            const dataRows = data.rows || [];
            if (columns.length === 0) break;

            const headerRow = columns.map((col) => ({
              text: col.header,
              options: { bold: true, color: textColor, fontSize: 11 },
            }));

            const bodyRows = dataRows.map((row) =>
              columns.map((col) => ({
                text: row[col.key] || "",
                options: { color: textColor, fontSize: 10 },
              }))
            );

            pptxSlide.addTable([headerRow, ...bodyRows], {
              x,
              y,
              w,
              h,
              fontSize: 10,
              fontFace: theme.fontFamily,
            });
            break;
          }

          case "card-group": {
            const data = block.data as CardGroupBlockData;
            const cards = data.cards || [];
            const cols = data.columns || 3;
            const cardW = w / cols;
            cards.forEach((card, i) => {
              const cardX = x + (i % cols) * cardW;
              const cardY = y + Math.floor(i / cols) * (h / 2);
              const parts: { text: string; options: Record<string, unknown> }[] = [];
              if (card.title) {
                parts.push({ text: card.title, options: { bold: true, fontSize: 12, color: textColor } });
              }
              if (card.body) {
                parts.push({ text: `\n${card.body}`, options: { fontSize: 10, color: textColor } });
              }
              if (parts.length > 0) {
                pptxSlide.addText(parts, {
                  x: cardX,
                  y: cardY,
                  w: cardW * 0.95,
                  h: h / 2,
                  fontFace: theme.fontFamily,
                });
              }
            });
            break;
          }

          case "image": {
            const data = block.data as ImageBlockData;
            if (data.src) {
              try {
                pptxSlide.addImage({ path: data.src, x, y, w, h });
              } catch {
                // Image URL may be unreachable — skip silently
              }
            }
            break;
          }

          case "divider": {
            const data = block.data as DividerBlockData;
            const lineColor = data.color ? stripHash(data.color) : stripHash(theme.accent);
            pptxSlide.addShape(pptx.shapes.LINE, {
              x,
              y,
              w,
              h: 0,
              line: { color: lineColor, width: data.thickness || 1 },
            });
            break;
          }

          case "spacer":
            // Empty space — nothing to render
            break;

          default:
            // Unknown block type — skip silently
            break;
        }
      }
    } else {
      // Legacy fallback: no v2 blocks, render from slide data fields
      const textColor = dark ? stripHash(theme.textPrimary) : stripHash(theme.textOnLight);
      let cursorY = 0.5;

      // Title
      if (slideData.title) {
        pptxSlide.addText(slideData.title, {
          x: 0.5,
          y: cursorY,
          w: 9,
          h: 0.8,
          fontSize: 32,
          bold: true,
          color: textColor,
          fontFace: theme.headingFont,
        });
        cursorY += 1.0;
      }

      // Subtitle
      if (slideData.subtitle) {
        pptxSlide.addText(slideData.subtitle, {
          x: 0.5,
          y: cursorY,
          w: 9,
          h: 0.5,
          fontSize: 18,
          color: "888888",
          fontFace: theme.fontFamily,
        });
        cursorY += 0.7;
      }

      // Content bullets
      if (slideData.content && slideData.content.length > 0) {
        pptxSlide.addText(
          slideData.content.map((item) => ({ text: item, options: { bullet: true } })),
          {
            x: 0.5,
            y: cursorY,
            w: 9,
            h: Math.min(slideData.content.length * 0.4, 3),
            fontSize: 14,
            color: textColor,
            fontFace: theme.fontFamily,
          }
        );
        cursorY += Math.min(slideData.content.length * 0.4, 3) + 0.2;
      }

      // Metrics
      if (slideData.metrics && slideData.metrics.length > 0) {
        const metricW = 9 / slideData.metrics.length;
        slideData.metrics.forEach((metric, i) => {
          const parts = [
            { text: metric.value, options: { fontSize: 36, bold: true, color: stripHash(theme.accent) } },
            { text: `\n${metric.label}`, options: { fontSize: 12, color: textColor } },
          ];
          if (metric.change) {
            parts.push({ text: `  ${metric.change}`, options: { fontSize: 12, color: "888888" } });
          }
          pptxSlide.addText(parts, {
            x: 0.5 + i * metricW,
            y: cursorY,
            w: metricW * 0.9,
            h: 1.2,
            fontFace: theme.fontFamily,
          });
        });
        cursorY += 1.4;
      }

      // Team members
      if (slideData.team && slideData.team.length > 0) {
        const memberW = 9 / slideData.team.length;
        slideData.team.forEach((member, i) => {
          const parts: { text: string; options: Record<string, unknown> }[] = [
            { text: member.name, options: { bold: true, fontSize: 16, color: textColor } },
            { text: `\n${member.role}`, options: { fontSize: 12, color: textColor } },
          ];
          if (member.bio) {
            parts.push({ text: `\n${member.bio}`, options: { fontSize: 11, color: "888888" } });
          }
          pptxSlide.addText(parts, {
            x: 0.5 + i * memberW,
            y: cursorY,
            w: memberW * 0.9,
            h: 1.5,
            fontFace: theme.fontFamily,
          });
        });
        cursorY += 1.7;
      }

      // Chart
      if (slideData.chartData && slideData.chartData.data.length > 0) {
        const chartTypeStr = slideData.chartData.type;
        let pptxChartType: string;
        if (chartTypeStr === "line") pptxChartType = pptx.charts.LINE;
        else if (chartTypeStr === "pie") pptxChartType = pptx.charts.PIE;
        else if (chartTypeStr === "area") pptxChartType = pptx.charts.AREA;
        else pptxChartType = pptx.charts.BAR;

        const chartData = [
          {
            name: slideData.chartData.label || "Series",
            labels: slideData.chartData.data.map((d) => d.label),
            values: slideData.chartData.data.map((d) => d.value),
          },
        ];

        pptxSlide.addChart(pptxChartType, chartData, {
          x: 0.5,
          y: cursorY,
          w: 9,
          h: Math.max(5.625 - cursorY - 0.3, 1.5),
        });
      }

      // Timeline
      if (slideData.timeline && slideData.timeline.length > 0) {
        slideData.timeline.forEach((item) => {
          const parts: { text: string; options: Record<string, unknown> }[] = [
            { text: item.date, options: { fontSize: 10, color: stripHash(theme.accent) } },
            { text: `  ${item.title}`, options: { fontSize: 14, bold: true, color: textColor } },
          ];
          if (item.description) {
            parts.push({ text: ` \u2014 ${item.description}`, options: { fontSize: 11, color: "888888" } });
          }
          pptxSlide.addText(parts, {
            x: 0.5,
            y: cursorY,
            w: 9,
            h: 0.5,
            fontFace: theme.fontFamily,
          });
          cursorY += 0.6;
        });
      }
    }
  }

  await pptx.writeFile({ fileName: `${deckTitle}-pitch-deck.pptx` });
}
