"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_CATEGORIES, BLOCK_META, type BlockCategory } from "@/lib/editor/block-types";

interface BlockTemplate {
  type: string;
  label: string;
  category: BlockCategory;
  icon: React.ReactNode;
}

/** Build the full 16-block template list from BLOCK_CATEGORIES + BLOCK_META */
function buildTemplates(): BlockTemplate[] {
  const templates: BlockTemplate[] = [];
  const categories = Object.entries(BLOCK_CATEGORIES) as [BlockCategory, (typeof BLOCK_CATEGORIES)[BlockCategory]][];

  for (const [cat, meta] of categories) {
    for (const type of meta.types) {
      const blockMeta = BLOCK_META[type as keyof typeof BLOCK_META];
      if (!blockMeta) continue;
      templates.push({
        type,
        label: blockMeta.label,
        category: cat,
        icon: getBlockIcon(blockMeta.icon),
      });
    }
  }
  return templates;
}

/** Map icon names to simple SVG paths */
function getBlockIcon(iconName: string): React.ReactNode {
  const iconPaths: Record<string, string> = {
    AlignLeft: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
    Type: "M4 7V4h16v3M9 20h6M12 4v16",
    List: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    Quote: "M7.5 8.25h9M7.5 12H12m-5.25 6l3-3h6.75a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v6.75a2.25 2.25 0 002.25 2.25H6v3z",
    AlertCircle: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
    TrendingUp: "M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941",
    BarChart3: "M3 3v18h18M7 16V8m4 8V5m4 11v-4m4 4V9",
    Layers: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.43 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25m11.142 0L12 7.5 6.43 9.75",
    Image: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z",
    Grid3X3: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    Square: "M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z",
    Users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    Clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    Minus: "M5 12h14",
  };

  const path = iconPaths[iconName];
  if (!path) {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const TEMPLATES = buildTemplates();

function DraggableBlockTile({ template }: { template: BlockTemplate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-template-${template.type}`,
    data: {
      type: "block-template",
      blockType: template.type,
      label: template.label,
    },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 cursor-grab active:cursor-grabbing transition-all select-none"
    >
      <div className="text-white/60">{template.icon}</div>
      <span className="text-[9px] font-medium text-white/50 text-center leading-tight">
        {template.label}
      </span>
    </div>
  );
}

/**
 * Categorized block palette for the editor sidebar "Blocks" tab.
 * 16 block types in 5 color-coded categories.
 */
export default function BlockLibrary() {
  const categories = Object.entries(BLOCK_CATEGORIES) as [BlockCategory, (typeof BLOCK_CATEGORIES)[BlockCategory]][];

  return (
    <div className="p-3 space-y-4">
      {categories.map(([cat, meta]) => {
        const catTemplates = TEMPLATES.filter((t) => t.category === cat);
        if (catTemplates.length === 0) return null;

        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: meta.color }}
              />
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                {meta.label}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {catTemplates.map((template) => (
                <DraggableBlockTile key={template.type} template={template} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Export templates for use in other components */
export { TEMPLATES as BLOCK_TEMPLATES };
export type { BlockTemplate };
