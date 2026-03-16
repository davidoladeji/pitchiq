"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";

const AVATAR_COLORS = ["#4361ee", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

interface TeamBlockProps {
  content: string;
  properties: Record<string, unknown>;
  isSelected: boolean;
  onUpdate: (content: string, properties?: Record<string, unknown>) => void;
  onSelect: () => void;
  /** Index used for avatar color cycling */
  index?: number;
}

function InlineEdit({
  value,
  onChange,
  className,
  style,
  tag: Tag = "span",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tag?: "span" | "p";
}) {
  const ref = useRef<HTMLElement>(null);

  const handleBlur = useCallback(() => {
    onChange(ref.current?.textContent || "");
  }, [onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement> & React.RefObject<HTMLParagraphElement>}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none focus:ring-2 focus:ring-electric/50 rounded transition-shadow ${className || ""}`}
      style={style}
    >
      {value}
    </Tag>
  );
}

export default function TeamBlock({
  content,
  properties,
  isSelected,
  onUpdate,
  onSelect,
  index = 0,
}: TeamBlockProps) {
  const name = (properties.name as string) || content || "Team Member";
  const role = (properties.role as string) || "Role";
  const bio = (properties.bio as string) || "";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const handleFieldUpdate = useCallback(
    (field: string, value: string) => {
      const newProps = { ...properties, [field]: value };
      const newContent = field === "name" ? value : content;
      onUpdate(newContent, newProps);
    },
    [properties, content, onUpdate]
  );

  return (
    <div
      className={`relative group transition-all rounded-xl p-4 md:p-5 flex flex-col items-center text-center ${
        isSelected
          ? "ring-2 ring-electric ring-offset-2"
          : "hover:ring-1 hover:ring-white/20"
      }`}
      style={{
        background: "rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
      onClick={onSelect}
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg md:text-xl select-none"
        style={{ background: avatarColor }}
      >
        {initials}
      </div>

      {/* Name */}
      <InlineEdit
        value={name}
        onChange={(v) => handleFieldUpdate("name", v)}
        className="font-bold text-sm md:text-base block"
      />

      {/* Role */}
      <InlineEdit
        value={role}
        onChange={(v) => handleFieldUpdate("role", v)}
        className="text-xs md:text-sm font-medium opacity-60 block"
        style={{ color: "var(--t-accent)" }}
      />

      {/* Bio */}
      {(bio || isSelected) && (
        <InlineEdit
          value={bio}
          onChange={(v) => handleFieldUpdate("bio", v)}
          tag="p"
          className="text-xs opacity-50 mt-2 leading-relaxed block"
        />
      )}
    </div>
  );
}
