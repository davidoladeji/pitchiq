/**
 * Block System v2 — Typed block architecture for the PitchIQ editor.
 *
 * Every block on a slide is an EditorBlock with:
 *   - Discriminated `type` key
 *   - Type-safe `data` via BlockDataMap
 *   - Grid `position` (12-column, 6-row)
 *   - Visual `style` overrides
 *   - `locked` / `hidden` / `animations` metadata
 */

/* ------------------------------------------------------------------ */
/*  Block Type Enum                                                    */
/* ------------------------------------------------------------------ */

export const BlockType = {
  // Content
  Text: "text",
  Heading: "heading",
  BulletList: "bullet-list",
  Quote: "quote",
  Callout: "callout",
  // Data
  Metric: "metric",
  MetricGrid: "metric-grid",
  Chart: "chart",
  ComparisonRow: "comparison-row",
  Funnel: "funnel",
  Table: "table",
  Progress: "progress",
  // Visual
  Image: "image",
  Icon: "icon",
  LogoGrid: "logo-grid",
  Shape: "shape",
  VideoEmbed: "video-embed",
  DeviceMockup: "device-mockup",
  // Story
  TeamMember: "team-member",
  TimelineItem: "timeline-item",
  // Layout
  Divider: "divider",
  Spacer: "spacer",
  CardGroup: "card-group",
} as const;

export type BlockType = (typeof BlockType)[keyof typeof BlockType];

/* ------------------------------------------------------------------ */
/*  Typed Data Interfaces (one per block type)                         */
/* ------------------------------------------------------------------ */

// ── Content ──

export interface TextBlockData {
  text: string;
  fontSize: number;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
}

export interface HeadingBlockData {
  text: string;
  level: 1 | 2 | 3;
  align: "left" | "center" | "right";
}

export interface BulletListBlockData {
  items: string[];
  ordered: boolean;
  style: "disc" | "check" | "arrow" | "number";
}

export interface QuoteBlockData {
  text: string;
  author: string;
  source?: string;
}

export interface CalloutBlockData {
  text: string;
  variant: "info" | "warning" | "success" | "tip";
  icon?: string;
}

// ── Data ──

export interface MetricBlockData {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  sparklineData?: number[];
  targetValue?: number;
  prefix?: string;
  suffix?: string;
  animateCountUp?: boolean;
}

export type ChartVariant =
  | "bar" | "bar-horizontal" | "bar-stacked" | "bar-grouped"
  | "line" | "area" | "area-stacked"
  | "pie" | "donut"
  | "funnel" | "waterfall" | "scatter" | "treemap"
  | "gauge" | "combo" | "sparkline";

export interface ChartAnnotation {
  id: string;
  dataIndex: number;
  label: string;
  offsetX: number;
  offsetY: number;
}

export interface ChartDataSeries {
  label: string;
  value: number;
  value2?: number;
  color?: string;
}

export interface ChartBlockData {
  chartType: ChartVariant;
  data: ChartDataSeries[];
  yAxisLabel?: string;
  annotations?: ChartAnnotation[];
  showLegend?: boolean;
  showGrid?: boolean;
  gaugeMin?: number;
  gaugeMax?: number;
  gaugeValue?: number;
}

export interface ComparisonRowBlockData {
  label: string;
  us: string;
  them: string;
}

export interface MetricGridBlockData {
  metrics: {
    label: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
    sparklineData?: number[];
    targetValue?: number;
    prefix?: string;
    suffix?: string;
  }[];
  variant: "cards" | "minimal" | "featured";
}

export interface FunnelStage {
  label: string;
  value: number;
  color?: string;
}

export interface FunnelBlockData {
  stages: FunnelStage[];
  variant: "funnel" | "inverted-pyramid" | "concentric-circles";
  showPercentages: boolean;
  showConversionRates: boolean;
}

export interface TableColumn {
  key: string;
  header: string;
  width?: number;
  align?: "left" | "center" | "right";
}

export interface TableBlockData {
  columns: TableColumn[];
  rows: Record<string, string>[];
  striped: boolean;
  headerVariant: "default" | "bold" | "accent" | "minimal";
  highlightColumn?: number;
  highlightRow?: number;
}

export interface ProgressMilestone {
  label: string;
  position: number; // 0-100
}

export interface ProgressBlockData {
  label: string;
  value: number; // 0-100
  target: number; // 0-100
  format: "bar" | "radial" | "stepped";
  milestones: ProgressMilestone[];
  showLabel: boolean;
  color?: string;
  steps?: number; // for stepped format
}

// ── Visual ──

export interface ImageBlockData {
  src: string;
  alt: string;
  fit: "cover" | "contain" | "fill";
  borderRadius?: number;
  shadow?: "none" | "sm" | "md" | "lg";
  opacity?: number;
  caption?: string;
  mask?: "none" | "circle" | "rounded";
  filters?: {
    grayscale?: number;   // 0-100
    blur?: number;        // 0-20
    brightness?: number;  // 0-200
    contrast?: number;    // 0-200
    saturate?: number;    // 0-200
  };
}

export interface IconBlockData {
  iconName: string;
  size: number;
  color: string;
  backgroundColor?: string;
  backgroundShape: "none" | "circle" | "rounded-square" | "square";
  strokeWidth: number;
}

export interface LogoGridBlockData {
  logos: { name: string; url?: string }[];
  columns: number;
  variant: "default" | "grayscale";
  header?: string;
}

export interface ShapeBlockData {
  shape: "rectangle" | "circle" | "line" | "arrow";
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  rotation?: number;
  borderRadius?: number;
  arrowHead?: "single" | "double" | "none";
  connectorSource?: string;
  connectorTarget?: string;
}

export interface VideoEmbedBlockData {
  url: string;
  provider?: "youtube" | "vimeo" | "loom" | "figma" | "generic";
  autoplay: boolean;
  startTime?: number;
  aspectRatio: "16:9" | "4:3" | "1:1";
}

export interface DeviceMockupBlockData {
  device: "iphone" | "macbook" | "ipad" | "browser";
  screenshotSrc: string;
  colorVariant: "silver" | "space-gray";
  orientation: "portrait" | "landscape";
}

// ── Story ──

export interface TeamMemberBlockData {
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
}

export interface TimelineItemBlockData {
  date: string;
  title: string;
  description?: string;
  completed?: boolean;
}

// ── Layout ──

export interface DividerBlockData {
  style: "solid" | "dashed" | "dotted" | "gradient";
  thickness: number;
  color?: string;
}

export interface SpacerBlockData {
  height: number; // grid row fractions (e.g. 1 = one row)
}

export interface CardGroupBlockData {
  cards: { title: string; body: string; icon?: string }[];
  columns: 2 | 3 | 4;
}

/* ------------------------------------------------------------------ */
/*  Block Data Map (discriminated union)                               */
/* ------------------------------------------------------------------ */

export interface BlockDataMap {
  text: TextBlockData;
  heading: HeadingBlockData;
  "bullet-list": BulletListBlockData;
  quote: QuoteBlockData;
  callout: CalloutBlockData;
  metric: MetricBlockData;
  "metric-grid": MetricGridBlockData;
  chart: ChartBlockData;
  "comparison-row": ComparisonRowBlockData;
  funnel: FunnelBlockData;
  table: TableBlockData;
  progress: ProgressBlockData;
  image: ImageBlockData;
  icon: IconBlockData;
  "logo-grid": LogoGridBlockData;
  shape: ShapeBlockData;
  "video-embed": VideoEmbedBlockData;
  "device-mockup": DeviceMockupBlockData;
  "team-member": TeamMemberBlockData;
  "timeline-item": TimelineItemBlockData;
  divider: DividerBlockData;
  spacer: SpacerBlockData;
  "card-group": CardGroupBlockData;
}

/* ------------------------------------------------------------------ */
/*  Position, Style, Animation                                         */
/* ------------------------------------------------------------------ */

/** Grid position within the 12-column × 6-row slide canvas. */
export interface BlockPosition {
  x: number; // column start (0-11)
  y: number; // row start (0-based, fractional OK)
  width: number; // column span (1-12)
  height: number; // row span (positive; 0 = auto)
  zIndex: number;
}

/** Visual style overrides applied to the block wrapper. */
export interface BlockStyle {
  backgroundColor?: string;
  borderRadius?: number;
  shadow?: "none" | "sm" | "md" | "lg";
  opacity?: number;
  padding?: number;
}

/** Presentation-mode animation. */
export interface BlockAnimation {
  trigger: "enter" | "click";
  type: "fade" | "slide" | "scale";
  duration: number;
  delay: number;
}

/* ------------------------------------------------------------------ */
/*  Core Block Interface                                               */
/* ------------------------------------------------------------------ */

export interface EditorBlock<T extends BlockType = BlockType> {
  id: string;
  type: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: BlockDataMap[T & keyof BlockDataMap];
  position: BlockPosition;
  style: BlockStyle;
  locked: boolean;
  hidden: boolean;
  animations: BlockAnimation[];
}

/** Keyed record of blocks (blockId → EditorBlock). */
export type BlocksRecord = Record<string, EditorBlock>;

/* ------------------------------------------------------------------ */
/*  Block Categories (matches mockup color system)                     */
/* ------------------------------------------------------------------ */

export type BlockCategory = "content" | "data" | "visual" | "story" | "layout";

export interface BlockCategoryMeta {
  label: string;
  color: string;
  types: BlockType[];
}

export const BLOCK_CATEGORIES: Record<BlockCategory, BlockCategoryMeta> = {
  content: {
    label: "Content",
    color: "#4361EE",
    types: [BlockType.Text, BlockType.Heading, BlockType.BulletList, BlockType.Quote, BlockType.Callout],
  },
  data: {
    label: "Data",
    color: "#06D6A0",
    types: [BlockType.Metric, BlockType.MetricGrid, BlockType.Chart, BlockType.ComparisonRow, BlockType.Funnel, BlockType.Table, BlockType.Progress],
  },
  visual: {
    label: "Visual",
    color: "#7209B7",
    types: [BlockType.Image, BlockType.Icon, BlockType.LogoGrid, BlockType.Shape, BlockType.VideoEmbed, BlockType.DeviceMockup],
  },
  story: {
    label: "Story",
    color: "#FF9F1C",
    types: [BlockType.TeamMember, BlockType.TimelineItem],
  },
  layout: {
    label: "Layout",
    color: "#5A5A72",
    types: [BlockType.Divider, BlockType.Spacer, BlockType.CardGroup],
  },
};

/* ------------------------------------------------------------------ */
/*  Block display metadata (icon + label for UI)                       */
/* ------------------------------------------------------------------ */

export const BLOCK_META: Record<BlockType, { label: string; icon: string }> = {
  text: { label: "Rich Text", icon: "AlignLeft" },
  heading: { label: "Heading", icon: "Type" },
  "bullet-list": { label: "Bullet List", icon: "List" },
  quote: { label: "Quote", icon: "Quote" },
  callout: { label: "Callout", icon: "AlertCircle" },
  metric: { label: "Metric", icon: "TrendingUp" },
  "metric-grid": { label: "Metric Grid", icon: "Grid3X3" },
  chart: { label: "Chart", icon: "BarChart3" },
  "comparison-row": { label: "Comparison", icon: "Layers" },
  funnel: { label: "Funnel", icon: "Funnel" },
  table: { label: "Table", icon: "Table" },
  progress: { label: "Progress", icon: "Target" },
  image: { label: "Image", icon: "Image" },
  icon: { label: "Icon", icon: "Smile" },
  "logo-grid": { label: "Logo Grid", icon: "Grid3X3" },
  shape: { label: "Shape", icon: "Square" },
  "video-embed": { label: "Video", icon: "Play" },
  "device-mockup": { label: "Mockup", icon: "Monitor" },
  "team-member": { label: "Team", icon: "Users" },
  "timeline-item": { label: "Timeline", icon: "Clock" },
  divider: { label: "Divider", icon: "Minus" },
  spacer: { label: "Spacer", icon: "Square" },
  "card-group": { label: "Card Group", icon: "Grid3X3" },
};
