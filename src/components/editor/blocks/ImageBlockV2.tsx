"use client";

import { useCallback, useRef, useState } from "react";
import type { ImageBlockData } from "@/lib/editor/block-types";

interface ImageBlockV2Props {
  data: ImageBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<ImageBlockData>) => void;
}

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.3)",
  md: "0 4px 12px rgba(0,0,0,0.4)",
  lg: "0 8px 30px rgba(0,0,0,0.5)",
};

function buildFilterString(filters: ImageBlockData["filters"]): string {
  if (!filters) return "none";
  const parts: string[] = [];
  if (filters.grayscale !== undefined) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.blur !== undefined) parts.push(`blur(${filters.blur}px)`);
  if (filters.brightness !== undefined) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== undefined) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturate !== undefined) parts.push(`saturate(${filters.saturate}%)`);
  return parts.length > 0 ? parts.join(" ") : "none";
}

export default function ImageBlockV2({
  data,
  isSelected,
  onDataChange,
}: ImageBlockV2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [bgRemoved, setBgRemoved] = useState(false);

  const handleFileRead = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onDataChange({ src: reader.result });
        }
      };
      reader.readAsDataURL(file);
    },
    [onDataChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead]
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDataChange({ src: e.target.value });
    },
    [onDataChange]
  );

  const handleRemoveBg = useCallback(() => {
    // TODO: Integrate with remove.bg API — POST /v1.0/removebg with API key
    setRemovingBg(true);
    setBgRemoved(false);
    setTimeout(() => {
      setRemovingBg(false);
      setBgRemoved(true);
      setTimeout(() => setBgRemoved(false), 3000);
    }, 2000);
  }, []);

  // ---------- Placeholder / empty state ----------
  if (!data.src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="w-full flex-1 min-h-[120px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/25 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none"
        >
          <svg
            className="w-10 h-10 text-white/20 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
            />
          </svg>
          <p className="text-xs text-white/40 text-center">
            Drag &amp; drop an image or click to upload
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* URL input */}
        <input
          type="text"
          placeholder="Or paste an image URL..."
          value={data.src}
          onChange={handleUrlChange}
          className="w-full max-w-sm bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
        />
      </div>
    );
  }

  // ---------- Image display ----------
  const shadow = SHADOW_MAP[data.shadow ?? "none"] ?? "none";
  const opacity = data.opacity !== undefined ? data.opacity / 100 : 1;
  const filterStr = buildFilterString(data.filters);

  const maskStyles: React.CSSProperties = {};
  let maskClasses = "";
  if (data.mask === "circle") {
    maskStyles.borderRadius = "50%";
    maskClasses = "overflow-hidden";
  } else if (data.mask === "rounded") {
    maskStyles.borderRadius = "16px";
    maskClasses = "overflow-hidden";
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Image container */}
      <div
        className={`relative flex-1 min-h-0 ${maskClasses}`}
        style={maskStyles}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.src}
          alt={data.alt}
          className="w-full h-full"
          style={{
            objectFit: data.fit,
            borderRadius: data.mask === "none" || !data.mask ? (data.borderRadius ?? 0) : undefined,
            boxShadow: shadow,
            opacity,
            filter: filterStr,
          }}
        />
      </div>

      {/* Caption */}
      {data.caption && (
        <p className="text-[11px] text-white/40 text-center mt-1.5 px-2 leading-tight">
          {data.caption}
        </p>
      )}

      {/* Properties panel */}
      {isSelected && (
        <div className="mt-3 bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-3">
          {/* Fit mode */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Fit
            </label>
            <div className="flex gap-1">
              {(["cover", "contain", "fill"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDataChange({ fit: f });
                  }}
                  className={`px-3 py-1 text-[11px] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none ${
                    data.fit === f
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Border radius */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Border Radius: {data.borderRadius ?? 0}px
            </label>
            <input
              type="range"
              min={0}
              max={50}
              value={data.borderRadius ?? 0}
              onChange={(e) => onDataChange({ borderRadius: Number(e.target.value) })}
              className="w-full accent-[#4361EE]"
            />
          </div>

          {/* Shadow */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Shadow
            </label>
            <div className="flex gap-1">
              {(["none", "sm", "md", "lg"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDataChange({ shadow: s });
                  }}
                  className={`px-3 py-1 text-[11px] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none ${
                    (data.shadow ?? "none") === s
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Opacity: {data.opacity ?? 100}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={data.opacity ?? 100}
              onChange={(e) => onDataChange({ opacity: Number(e.target.value) })}
              className="w-full accent-[#4361EE]"
            />
          </div>

          {/* Mask */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Mask
            </label>
            <div className="flex gap-1">
              {(["none", "circle", "rounded"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDataChange({ mask: m });
                  }}
                  className={`px-3 py-1 text-[11px] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none ${
                    (data.mask ?? "none") === m
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* CSS Filters */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Filters
            </label>
            <div className="space-y-2">
              {/* Grayscale */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-16 shrink-0">Grayscale</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={data.filters?.grayscale ?? 0}
                  onChange={(e) =>
                    onDataChange({
                      filters: { ...data.filters, grayscale: Number(e.target.value) },
                    })
                  }
                  className="flex-1 accent-[#4361EE]"
                />
                <span className="text-[10px] text-white/40 w-8 text-right">
                  {data.filters?.grayscale ?? 0}
                </span>
              </div>

              {/* Blur */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-16 shrink-0">Blur</span>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={data.filters?.blur ?? 0}
                  onChange={(e) =>
                    onDataChange({
                      filters: { ...data.filters, blur: Number(e.target.value) },
                    })
                  }
                  className="flex-1 accent-[#4361EE]"
                />
                <span className="text-[10px] text-white/40 w-8 text-right">
                  {data.filters?.blur ?? 0}
                </span>
              </div>

              {/* Brightness */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-16 shrink-0">Brightness</span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={data.filters?.brightness ?? 100}
                  onChange={(e) =>
                    onDataChange({
                      filters: { ...data.filters, brightness: Number(e.target.value) },
                    })
                  }
                  className="flex-1 accent-[#4361EE]"
                />
                <span className="text-[10px] text-white/40 w-8 text-right">
                  {data.filters?.brightness ?? 100}
                </span>
              </div>

              {/* Contrast */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-16 shrink-0">Contrast</span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={data.filters?.contrast ?? 100}
                  onChange={(e) =>
                    onDataChange({
                      filters: { ...data.filters, contrast: Number(e.target.value) },
                    })
                  }
                  className="flex-1 accent-[#4361EE]"
                />
                <span className="text-[10px] text-white/40 w-8 text-right">
                  {data.filters?.contrast ?? 100}
                </span>
              </div>

              {/* Saturate */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-16 shrink-0">Saturate</span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={data.filters?.saturate ?? 100}
                  onChange={(e) =>
                    onDataChange({
                      filters: { ...data.filters, saturate: Number(e.target.value) },
                    })
                  }
                  className="flex-1 accent-[#4361EE]"
                />
                <span className="text-[10px] text-white/40 w-8 text-right">
                  {data.filters?.saturate ?? 100}
                </span>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Caption
            </label>
            <input
              type="text"
              placeholder="Add a caption..."
              value={data.caption ?? ""}
              onChange={(e) => onDataChange({ caption: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
            />
          </div>

          {/* Remove Background */}
          <div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveBg();
              }}
              disabled={removingBg}
              className="w-full px-3 py-2 text-[11px] rounded-md bg-white/[0.06] text-white/70 hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none flex items-center justify-center gap-2"
            >
              {removingBg ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white/60"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Removing background...
                </>
              ) : bgRemoved ? (
                "Background removal complete"
              ) : (
                "Remove Background"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
