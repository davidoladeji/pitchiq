import type { SlideData } from "@/lib/types";
import type { CompositionPattern } from "./compositions";
import type { VisualSystem } from "./visual-system";

/**
 * Map a SlideData + CompositionPattern + VisualSystem into positioned
 * editorBlocksV2.  This bridges the generation pipeline to the editor
 * rendering engine.
 *
 * For now we store composition metadata on the slide so the renderer
 * can access it. A future editor upgrade will fully use the block grid.
 */
export function mapSlideToBlocks(
  slide: SlideData,
  composition: CompositionPattern,
  visualSystem: VisualSystem,
): Record<string, unknown> {
  return {
    compositionId: composition.id,
    compositionCategory: composition.category,
    density: composition.density,
    visualPersonality: null, // filled by caller if needed
    zones: composition.zones.map((zone) => ({
      id: zone.id,
      role: zone.role,
      gridArea: zone.gridArea,
      optional: zone.optional || false,
    })),
    style: {
      headingFont: visualSystem.typography.headingFont,
      headingWeight: visualSystem.typography.headingWeight,
      bodyFont: visualSystem.typography.bodyFont,
      cardRadius: visualSystem.spacing.cardRadius,
      cardPadding: visualSystem.spacing.cardPadding,
      backgroundPattern: visualSystem.motifs.backgroundPattern,
      iconStyle: visualSystem.motifs.iconStyle,
      chartStyle: visualSystem.dataViz.chartStyle,
    },
  };
}
