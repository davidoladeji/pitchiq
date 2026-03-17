"use client";

import { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import type { IconBlockData } from "@/lib/editor/block-types";
import type { LucideProps } from "lucide-react";

interface IconBlockProps {
  data: IconBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<IconBlockData>) => void;
}

const POPULAR_ICONS = [
  "Zap", "Heart", "Star", "ArrowRight", "Check", "X", "Plus", "Minus",
  "Search", "Settings", "Home", "User", "Mail", "Phone", "Globe", "Lock",
  "Unlock", "Eye", "EyeOff", "Download", "Upload", "Share", "Copy", "Trash",
  "Edit", "Save", "RefreshCw", "Clock", "Calendar", "MapPin", "Navigation",
  "Bookmark", "Bell", "Camera", "Mic", "Volume2", "Play", "Pause",
  "SkipForward", "SkipBack", "Maximize", "Minimize", "ChevronRight",
  "ChevronLeft", "ChevronUp", "ChevronDown", "ArrowUp", "ArrowDown",
  "ArrowLeft", "AlertCircle", "AlertTriangle", "Info", "HelpCircle",
  "CheckCircle", "XCircle", "Wifi", "Battery", "Cpu", "Database", "Server",
  "Cloud", "CloudUpload", "Code", "Terminal", "GitBranch", "Github",
  "Linkedin", "Twitter", "Facebook", "Instagram", "Youtube", "Slack", "Figma",
  "Chrome", "Smartphone", "Tablet", "Monitor", "Laptop", "Printer",
  "Headphones", "Music", "Image", "Film", "FileText", "Folder", "Archive",
  "Package", "Box", "Gift", "CreditCard", "DollarSign", "TrendingUp",
  "TrendingDown", "BarChart3", "PieChart", "Activity", "Target", "Award",
  "Flag", "Layers", "Layout", "Grid", "List", "AlignLeft", "AlignCenter",
  "AlignRight", "Bold", "Italic", "Underline", "Type",
];

export default function IconBlock({
  data,
  isSelected,
  onDataChange,
}: IconBlockProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[data.iconName] as React.ComponentType<LucideProps> | undefined;

  const filteredIcons = useMemo(() => {
    if (!searchQuery) return POPULAR_ICONS;
    const q = searchQuery.toLowerCase();
    return POPULAR_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [searchQuery]);

  const bgShape = data.backgroundShape ?? "none";
  const bgColor = data.backgroundColor ?? "#4361EE20";

  const backgroundClasses =
    bgShape === "circle"
      ? "rounded-full"
      : bgShape === "rounded-square"
        ? "rounded-[12px]"
        : bgShape === "square"
          ? "rounded-none"
          : "";

  const renderIcon = (
    name: string,
    size: number,
    color: string,
    strokeWidth: number,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Comp = (LucideIcons as any)[name] as React.ComponentType<LucideProps> | undefined;
    if (!Comp) return null;
    return <Comp size={size} color={color} strokeWidth={strokeWidth} />;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Icon display */}
      <div className="flex items-center justify-center">
        {bgShape !== "none" ? (
          <div
            className={`flex items-center justify-center ${backgroundClasses}`}
            style={{
              width: data.size + 24,
              height: data.size + 24,
              backgroundColor: bgColor,
            }}
          >
            {IconComponent ? (
              <IconComponent
                size={data.size}
                color={data.color}
                strokeWidth={data.strokeWidth}
              />
            ) : (
              <div
                className="flex items-center justify-center text-white/30 text-xs"
                style={{ width: data.size, height: data.size }}
              >
                ?
              </div>
            )}
          </div>
        ) : IconComponent ? (
          <IconComponent
            size={data.size}
            color={data.color}
            strokeWidth={data.strokeWidth}
          />
        ) : (
          <div
            className="flex items-center justify-center text-white/30 text-xs"
            style={{ width: data.size, height: data.size }}
          >
            ?
          </div>
        )}
      </div>

      {/* Picker panel (when selected) */}
      {isSelected && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 bg-[#1A1A24] border border-white/10 rounded-lg p-3 shadow-xl">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search icons..."
            className="w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] mb-2"
          />

          {/* Icon grid */}
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto mb-3 pr-1">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onDataChange({ iconName: name });
                }}
                className={`flex items-center justify-center w-full aspect-square rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                  data.iconName === name
                    ? "bg-[#4361EE] text-white"
                    : "text-white/60 hover:bg-white/10"
                }`}
              >
                {renderIcon(name, 20, data.iconName === name ? "#fff" : "currentColor", 2)}
              </button>
            ))}
            {filteredIcons.length === 0 && (
              <div className="col-span-6 text-center text-white/30 text-xs py-4">
                No icons found
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-3 space-y-2.5">
            {/* Size slider */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-white/50 w-14 shrink-0">Size</label>
              <input
                type="range"
                min={16}
                max={128}
                value={data.size}
                onChange={(e) => onDataChange({ size: Number(e.target.value) })}
                className="flex-1 accent-[#4361EE]"
              />
              <span className="text-[10px] text-white/50 w-8 text-right">
                {data.size}px
              </span>
            </div>

            {/* Stroke width slider */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-white/50 w-14 shrink-0">Stroke</label>
              <input
                type="range"
                min={1}
                max={4}
                step={0.5}
                value={data.strokeWidth}
                onChange={(e) =>
                  onDataChange({ strokeWidth: Number(e.target.value) })
                }
                className="flex-1 accent-[#4361EE]"
              />
              <span className="text-[10px] text-white/50 w-8 text-right">
                {data.strokeWidth}
              </span>
            </div>

            {/* Color input */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-white/50 w-14 shrink-0">Color</label>
              <input
                type="text"
                value={data.color}
                onChange={(e) => onDataChange({ color: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
              />
              <input
                type="color"
                value={data.color}
                onChange={(e) => onDataChange({ color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-white/10 bg-transparent"
              />
            </div>

            {/* Background shape buttons */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-white/50 w-14 shrink-0">Shape</label>
              <div className="flex gap-0.5 bg-white/5 rounded-md p-0.5">
                {(["none", "circle", "rounded-square", "square"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onDataChange({ backgroundShape: s });
                      }}
                      className={`px-2 py-0.5 text-[10px] capitalize rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                        bgShape === s
                          ? "bg-[#4361EE] text-white"
                          : "text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {s === "rounded-square" ? "rounded" : s}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Background color input (only when shape is not "none") */}
            {bgShape !== "none" && (
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-white/50 w-14 shrink-0">Bg color</label>
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) =>
                    onDataChange({ backgroundColor: e.target.value })
                  }
                  className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                />
                <input
                  type="color"
                  value={bgColor.length === 9 ? bgColor.slice(0, 7) : bgColor}
                  onChange={(e) =>
                    onDataChange({ backgroundColor: e.target.value })
                  }
                  className="w-6 h-6 rounded cursor-pointer border border-white/10 bg-transparent"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
