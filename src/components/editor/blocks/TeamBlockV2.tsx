"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import type { TeamMemberBlockData } from "@/lib/editor/block-types";

interface TeamBlockV2Props {
  data: TeamMemberBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<TeamMemberBlockData>) => void;
}

const AVATAR_COLORS = ["#4361ee", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

function InlineEdit({
  value,
  onChange,
  className,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const handleBlur = useCallback(() => { onChange(ref.current?.textContent || ""); }, [onChange]);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); }
  }, []);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/50 rounded transition-shadow ${className || ""}`}
      style={style}
    >
      {value}
    </span>
  );
}

export default function TeamBlockV2({
  data,
  isSelected,
  onDataChange,
}: TeamBlockV2Props) {
  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Deterministic color from name
  const colorIdx = data.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const avatarColor = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];

  return (
    <div
      className="w-full h-full rounded-xl p-4 flex flex-col items-center text-center justify-center"
      style={{
        background: "rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg select-none"
        style={{ background: avatarColor }}
      >
        {initials}
      </div>
      <InlineEdit
        value={data.name}
        onChange={(v) => onDataChange({ name: v })}
        className="font-bold text-sm block"
      />
      <InlineEdit
        value={data.role}
        onChange={(v) => onDataChange({ role: v })}
        className="text-xs font-medium opacity-60 block"
        style={{ color: "var(--t-accent)" }}
      />
      {(data.bio || isSelected) && (
        <InlineEdit
          value={data.bio || ""}
          onChange={(v) => onDataChange({ bio: v })}
          className="text-[10px] opacity-50 mt-2 leading-relaxed block"
        />
      )}
    </div>
  );
}
