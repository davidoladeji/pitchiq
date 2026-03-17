/**
 * Block-level AI Actions — Stubbed async functions for contextual AI operations.
 *
 * Each action accepts a block type, action name, and block data,
 * returning a Promise<Record<string, unknown>> with the updated data.
 *
 * All actions are currently stubbed with placeholder responses.
 * To integrate a real LLM API:
 *   1. Replace the stub implementations with API calls
 *   2. The function signature stays the same: aiAction(blockType, action, blockData)
 *   3. Return a partial data patch that merges into the block's data
 *
 * TODO: Integrate with OpenAI/Anthropic API for real AI-powered rewrites.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AIActionId = string;

export interface AIActionDef {
  id: AIActionId;
  label: string;
  description: string;
}

/** Map of block type → available AI actions. */
export const BLOCK_AI_ACTIONS: Record<string, AIActionDef[]> = {
  text: [
    { id: "rewrite-punchier", label: "Rewrite punchier", description: "Make the text more concise and impactful" },
    { id: "expand", label: "Expand", description: "Add more detail and context" },
    { id: "condense", label: "Condense", description: "Shorten while keeping the key message" },
    { id: "simplify", label: "Simplify", description: "Use simpler language for broader audiences" },
  ],
  heading: [
    { id: "rewrite-punchier", label: "Rewrite punchier", description: "Make the heading more compelling" },
    { id: "expand", label: "Expand", description: "Turn into a longer descriptive heading" },
    { id: "condense", label: "Condense", description: "Shorten to 3-5 words" },
    { id: "simplify", label: "Simplify", description: "Use clearer, simpler words" },
  ],
  "bullet-list": [
    { id: "rewrite-punchier", label: "Rewrite punchier", description: "Make each point more impactful" },
    { id: "expand", label: "Expand points", description: "Add supporting detail to each point" },
    { id: "condense", label: "Condense", description: "Trim each point to essentials" },
    { id: "reorder-impact", label: "Reorder by impact", description: "Put strongest points first" },
  ],
  quote: [
    { id: "rewrite-punchier", label: "Sharpen quote", description: "Make the quote more memorable" },
    { id: "simplify", label: "Simplify", description: "Use more accessible language" },
  ],
  callout: [
    { id: "rewrite-punchier", label: "Rewrite punchier", description: "Make the callout more attention-grabbing" },
    { id: "condense", label: "Condense", description: "Trim to a single impactful sentence" },
  ],
  metric: [
    { id: "verify-claim", label: "Verify claim", description: "Check if this metric is realistic and well-sourced" },
    { id: "add-context", label: "Add context", description: "Suggest comparison benchmarks or industry context" },
    { id: "suggest-visualization", label: "Suggest visualization", description: "Recommend the best way to display this metric" },
  ],
  "metric-grid": [
    { id: "verify-claim", label: "Verify claims", description: "Check if these metrics are realistic" },
    { id: "add-context", label: "Add context", description: "Add industry benchmarks for comparison" },
  ],
  chart: [
    { id: "suggest-chart-type", label: "Suggest chart type", description: "Recommend the best chart type for this data" },
    { id: "add-annotations", label: "Add annotations", description: "Highlight key data points with labels" },
    { id: "improve-labels", label: "Improve labels", description: "Make axis labels and legend clearer" },
  ],
  "comparison-row": [
    { id: "strengthen-comparison", label: "Strengthen comparison", description: "Make the differentiation clearer" },
    { id: "add-details", label: "Add details", description: "Flesh out comparison criteria" },
  ],
  "team-member": [
    { id: "improve-bio", label: "Improve bio", description: "Strengthen the professional bio" },
    { id: "add-credibility", label: "Add credibility", description: "Suggest credentials or achievements to highlight" },
  ],
  "card-group": [
    { id: "rewrite-punchier", label: "Rewrite punchier", description: "Make card titles and descriptions more compelling" },
    { id: "condense", label: "Condense", description: "Trim card text to essentials" },
  ],
};

/** Get available AI actions for a given block type. */
export function getAIActionsForBlock(blockType: string): AIActionDef[] {
  return BLOCK_AI_ACTIONS[blockType] || [];
}

/* ------------------------------------------------------------------ */
/*  Stubbed AI Action Executor                                         */
/* ------------------------------------------------------------------ */

/**
 * Execute an AI action on a block.
 *
 * @param blockType The type of the block (e.g., "text", "chart")
 * @param actionId  The action to perform (e.g., "rewrite-punchier")
 * @param blockData The current block data
 * @returns A Promise resolving to a partial data patch to merge into the block
 *
 * TODO: Replace stub implementations with real LLM API calls.
 * Suggested integration pattern:
 *   const response = await fetch('/api/ai/block-action', {
 *     method: 'POST',
 *     body: JSON.stringify({ blockType, actionId, blockData }),
 *   });
 *   return response.json();
 */
export async function executeAIAction(
  blockType: string,
  actionId: string,
  blockData: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

  // TODO: Replace these stubs with actual LLM API calls
  switch (blockType) {
    case "text":
    case "heading":
    case "callout": {
      const text = (blockData.text as string) || "";
      switch (actionId) {
        case "rewrite-punchier":
          return { text: text.length > 50 ? text.slice(0, 50) + "." : text + " — bold and clear." };
        case "expand":
          return { text: text + " This additional context provides deeper insight into the core message." };
        case "condense":
          return { text: text.split(".")[0] + "." };
        case "simplify":
          return { text: text.replace(/utilize/gi, "use").replace(/leverage/gi, "use").replace(/synerg/gi, "work together") };
        default:
          return {};
      }
    }

    case "bullet-list": {
      const items = (blockData.items as string[]) || [];
      switch (actionId) {
        case "rewrite-punchier":
          return { items: items.map((item) => item.endsWith(".") ? item : item + ".") };
        case "expand":
          return { items: items.map((item) => item + " — with supporting detail") };
        case "condense":
          return { items: items.map((item) => item.split(",")[0]) };
        case "reorder-impact":
          return { items: [...items].reverse() }; // Stub: just reverse
        default:
          return {};
      }
    }

    case "quote": {
      const text = (blockData.text as string) || "";
      switch (actionId) {
        case "rewrite-punchier":
          return { text: `"${text.replace(/^"|"$/g, "")}"` };
        case "simplify":
          return { text: text.replace(/furthermore/gi, "also").replace(/nevertheless/gi, "still") };
        default:
          return {};
      }
    }

    case "metric": {
      switch (actionId) {
        case "verify-claim":
          // Stub: return a suggestion as context
          return {}; // No data change — would show a verification result in UI
        case "add-context":
          return { change: (blockData.change as string) || "+0%", trend: "up" };
        case "suggest-visualization":
          return {}; // Would suggest sparkline or chart type
        default:
          return {};
      }
    }

    case "chart": {
      switch (actionId) {
        case "suggest-chart-type":
          // Stub: suggest based on data count
          const data = (blockData.data as { label: string; value: number }[]) || [];
          const suggestedType = data.length <= 4 ? "bar" : data.length <= 6 ? "line" : "area";
          return { chartType: suggestedType };
        case "add-annotations":
          return {}; // Would add annotation objects to the data
        case "improve-labels":
          return {}; // Would improve yAxisLabel and data labels
        default:
          return {};
      }
    }

    case "comparison-row": {
      switch (actionId) {
        case "strengthen-comparison":
          return {
            us: ((blockData.us as string) || "") + " (industry-leading)",
            them: ((blockData.them as string) || "") + " (limited)",
          };
        case "add-details":
          return {};
        default:
          return {};
      }
    }

    case "team-member": {
      switch (actionId) {
        case "improve-bio":
          return { bio: ((blockData.bio as string) || "") + " Previously at a Fortune 500 company." };
        case "add-credibility":
          return { bio: ((blockData.bio as string) || "") + " 10+ years of industry experience." };
        default:
          return {};
      }
    }

    default:
      return {};
  }
}
