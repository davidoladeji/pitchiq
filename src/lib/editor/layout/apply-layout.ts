/**
 * Apply Layout — takes a SlideLayout and either creates new blocks
 * in the zones or repositions existing blocks to fit the zones.
 */

import type { EditorBlock, BlocksRecord, BlockType } from "../block-types";
import { createDefaultEditorBlock } from "../block-defaults";
import type { SlideLayout } from "./layout-types";

/**
 * Apply a layout to a set of existing blocks.
 *
 * Strategy:
 * 1. For each zone, try to find an existing block whose type matches
 *    the zone's suggestedBlock. If found, reposition it into the zone.
 * 2. If no matching block exists, create a new default block for the zone.
 * 3. Blocks that don't fit any zone stay in place (appended at bottom).
 *
 * Returns new blocks record and order array.
 */
export function applyLayout(
  layout: SlideLayout,
  existingBlocks: BlocksRecord,
  existingOrder: string[],
): { blocks: BlocksRecord; order: string[] } {
  const newBlocks: BlocksRecord = {};
  const newOrder: string[] = [];
  const usedBlockIds = new Set<string>();

  // Get existing blocks as ordered array
  const available = existingOrder
    .map((id) => existingBlocks[id])
    .filter(Boolean) as EditorBlock[];

  // For each zone, find or create a block
  for (const zone of layout.zones) {
    const matchIdx = available.findIndex(
      (b) => !usedBlockIds.has(b.id) && b.type === zone.suggestedBlock,
    );

    if (matchIdx !== -1) {
      // Reposition existing block into this zone
      const block = available[matchIdx];
      usedBlockIds.add(block.id);
      newBlocks[block.id] = {
        ...block,
        position: {
          ...block.position,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
        },
      };
      newOrder.push(block.id);
    } else {
      // Create a new default block for this zone
      const block = createDefaultEditorBlock(zone.suggestedBlock as BlockType, 0);
      block.position = {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        zIndex: newOrder.length,
      };
      newBlocks[block.id] = block;
      newOrder.push(block.id);
    }
  }

  // Append any remaining blocks that weren't placed in zones
  for (const block of available) {
    if (!usedBlockIds.has(block.id)) {
      newBlocks[block.id] = block;
      newOrder.push(block.id);
    }
  }

  return { blocks: newBlocks, order: newOrder };
}

/**
 * Create a fresh slide from a layout (all new blocks).
 */
export function createBlocksFromLayout(
  layout: SlideLayout,
): { blocks: BlocksRecord; order: string[] } {
  const blocks: BlocksRecord = {};
  const order: string[] = [];

  for (const zone of layout.zones) {
    const block = createDefaultEditorBlock(zone.suggestedBlock as BlockType, 0);
    block.position = {
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      zIndex: order.length,
    };
    blocks[block.id] = block;
    order.push(block.id);
  }

  return { blocks, order };
}
