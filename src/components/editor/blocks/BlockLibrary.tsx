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

/** Build the full 20-block template list from BLOCK_CATEGORIES + BLOCK_META */
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
    Funnel: "M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9l3.75 3.75",
    Table: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 13.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 13.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m-1.125 1.125c0-.621-.504-1.125-1.125-1.125M13.125 12h1.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5",
    Target: "M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0m9-5a5 5 0 100 10 5 5 0 000-10m0 3a2 2 0 100 4 2 2 0 000-4",
    Smile: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
    Play: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z",
    Monitor: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z",
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
 * 20 block types in 5 color-coded categories.
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
