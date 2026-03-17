"use client";

/**
 * BlockRenderer — Maps an EditorBlock to its corresponding v2 component.
 * Used by the grid canvas to render blocks with typed data.
 */

import type { EditorBlock } from "@/lib/editor/block-types";
import type {
  TextBlockData,
  HeadingBlockData,
  BulletListBlockData,
  CalloutBlockData,
  MetricBlockData,
  MetricGridBlockData,
  ChartBlockData,
  ComparisonRowBlockData,
  FunnelBlockData,
  TableBlockData,
  ProgressBlockData,
  ImageBlockData,
  IconBlockData,
  LogoGridBlockData,
  ShapeBlockData,
  VideoEmbedBlockData,
  DeviceMockupBlockData,
  TeamMemberBlockData,
  TimelineItemBlockData,
  DividerBlockData,
  SpacerBlockData,
  CardGroupBlockData,
  QuoteBlockData,
} from "@/lib/editor/block-types";
import TextBlockV2 from "./TextBlockV2";
import HeadingBlock from "./HeadingBlock";
import BulletListBlock from "./BulletListBlock";
import CalloutBlock from "./CalloutBlock";
import MetricBlockV2 from "./MetricBlockV2";
import MetricGridBlock from "./MetricGridBlock";
import ChartBlockV2 from "./ChartBlockV2";
import TeamBlockV2 from "./TeamBlockV2";
import TimelineBlockV2 from "./TimelineBlockV2";
import QuoteBlockV2 from "./QuoteBlockV2";
import DividerBlock from "./DividerBlock";
import SpacerBlock from "./SpacerBlock";
import ShapeBlock from "./ShapeBlock";
import CardGroupBlock from "./CardGroupBlock";
import ComparisonBlockV2 from "./ComparisonBlockV2";
import LogoGridBlockV2 from "./LogoGridBlockV2";
import ImageBlockV2 from "./ImageBlockV2";
import FunnelBlock from "./FunnelBlock";
import TableBlock from "./TableBlock";
import ProgressBlock from "./ProgressBlock";
import IconBlock from "./IconBlock";
import VideoEmbedBlock from "./VideoEmbedBlock";
import DeviceMockupBlock from "./DeviceMockupBlock";

interface BlockRendererProps {
  block: EditorBlock;
  isSelected: boolean;
  onDataChange: (patch: Record<string, unknown>) => void;
}

export default function BlockRenderer({
  block,
  isSelected,
  onDataChange,
}: BlockRendererProps) {
  switch (block.type) {
    case "text":
      return (
        <TextBlockV2
          data={block.data as TextBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "heading":
      return (
        <HeadingBlock
          data={block.data as HeadingBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "bullet-list":
      return (
        <BulletListBlock
          data={block.data as BulletListBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "quote":
      return (
        <QuoteBlockV2
          data={block.data as QuoteBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "callout":
      return (
        <CalloutBlock
          data={block.data as CalloutBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "metric":
      return (
        <MetricBlockV2
          data={block.data as MetricBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "metric-grid":
      return (
        <MetricGridBlock
          data={block.data as MetricGridBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "chart":
      return (
        <ChartBlockV2
          data={block.data as ChartBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "comparison-row":
      return (
        <ComparisonBlockV2
          data={block.data as ComparisonRowBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "funnel":
      return (
        <FunnelBlock
          data={block.data as FunnelBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "table":
      return (
        <TableBlock
          data={block.data as TableBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "progress":
      return (
        <ProgressBlock
          data={block.data as ProgressBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "image":
      return (
        <ImageBlockV2
          data={block.data as ImageBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "logo-grid":
      return (
        <LogoGridBlockV2
          data={block.data as LogoGridBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "shape":
      return (
        <ShapeBlock
          data={block.data as ShapeBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "team-member":
      return (
        <TeamBlockV2
          data={block.data as TeamMemberBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "timeline-item":
      return (
        <TimelineBlockV2
          data={block.data as TimelineItemBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "divider":
      return (
        <DividerBlock
          data={block.data as DividerBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "spacer":
      return (
        <SpacerBlock
          data={block.data as SpacerBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "icon":
      return (
        <IconBlock
          data={block.data as IconBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "video-embed":
      return (
        <VideoEmbedBlock
          data={block.data as VideoEmbedBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "device-mockup":
      return (
        <DeviceMockupBlock
          data={block.data as DeviceMockupBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    case "card-group":
      return (
        <CardGroupBlock
          data={block.data as CardGroupBlockData}
          isSelected={isSelected}
          onDataChange={onDataChange}
        />
      );
    default:
      return (
        <div className="p-3 text-xs text-white/30 italic">
          Unknown block type: {block.type}
        </div>
      );
  }
}
