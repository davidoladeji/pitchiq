"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import type { LogoGridBlockData } from "@/lib/editor/block-types";

interface LogoGridBlockV2Props {
  data: LogoGridBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<LogoGridBlockData>) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clearbitUrl(name: string): string {
  return `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, "")}.com`;
}

const HEADER_PRESETS = [
  "Trusted by",
  "Backed by",
  "As seen in",
  "Our partners",
] as const;

/* ------------------------------------------------------------------ */
/*  InlineEdit                                                         */
/* ------------------------------------------------------------------ */

function InlineEdit({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
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
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/50 rounded transition-shadow ${className || ""}`}
    >
      {value}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function LogoGridBlockV2({
  data,
  isSelected,
  onDataChange,
}: LogoGridBlockV2Props) {
  const [bulkInput, setBulkInput] = useState("");
  const [domainInputs, setDomainInputs] = useState<Record<number, string>>({});

  /* --- Logo CRUD -------------------------------------------------- */

  const updateLogo = useCallback(
    (index: number, patch: Partial<{ name: string; url?: string }>) => {
      const newLogos = data.logos.map((l, i) =>
        i === index ? { ...l, ...patch } : l
      );
      onDataChange({ logos: newLogos });
    },
    [data.logos, onDataChange]
  );

  const removeLogo = useCallback(
    (index: number) => {
      onDataChange({ logos: data.logos.filter((_, i) => i !== index) });
    },
    [data.logos, onDataChange]
  );

  const addLogo = useCallback(() => {
    onDataChange({
      logos: [...data.logos, { name: `Partner ${data.logos.length + 1}` }],
    });
  }, [data.logos, onDataChange]);

  const fetchLogo = useCallback(
    (index: number, domain?: string) => {
      const logo = data.logos[index];
      const url = domain
        ? `https://logo.clearbit.com/${domain.toLowerCase().replace(/\s+/g, "")}`
        : clearbitUrl(logo.name);
      updateLogo(index, { url });
    },
    [data.logos, updateLogo]
  );

  /* --- Bulk add --------------------------------------------------- */

  const handleBulkAdd = useCallback(() => {
    const names = bulkInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    const newLogos = names.map((name) => ({ name }));
    onDataChange({ logos: [...data.logos, ...newLogos] });
    setBulkInput("");
  }, [bulkInput, data.logos, onDataChange]);

  const handleBulkKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleBulkAdd();
      }
    },
    [handleBulkAdd]
  );

  /* --- Variant / columns helpers ---------------------------------- */

  const isGrayscale = data.variant === "grayscale";

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="w-full h-full flex flex-col justify-center gap-3 p-3">
      {/* ---------- Header text ---------- */}
      {data.header && (
        <p className="text-center text-xs font-medium tracking-wide text-white/60 uppercase">
          {data.header}
        </p>
      )}

      {/* ---------- Logo grid ---------- */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${data.columns}, 1fr)` }}
      >
        {data.logos.map((logo, i) => (
          <div
            key={i}
            className="relative group/logo px-4 py-2.5 rounded-lg text-xs font-medium text-center flex flex-col items-center justify-center gap-1.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Logo image or name fallback */}
            {logo.url ? (
              <img
                src={logo.url}
                alt={logo.name}
                className="h-8 w-auto object-contain"
                style={
                  isGrayscale
                    ? {
                        filter: "grayscale(100%)",
                        transition: "filter 0.3s ease",
                      }
                    : undefined
                }
                onMouseEnter={(e) => {
                  if (isGrayscale) {
                    (e.currentTarget as HTMLImageElement).style.filter =
                      "grayscale(0%)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isGrayscale) {
                    (e.currentTarget as HTMLImageElement).style.filter =
                      "grayscale(100%)";
                  }
                }}
              />
            ) : (
              <span className="text-white/70 text-xs">{logo.name}</span>
            )}

            {/* Editing controls per-logo */}
            {isSelected && (
              <div className="flex flex-col items-center gap-1 w-full mt-1">
                {/* Inline name edit */}
                <InlineEdit
                  value={logo.name}
                  onChange={(v) => updateLogo(i, { name: v })}
                  className="text-[10px] text-white/50"
                />

                {/* Domain input + Fetch button */}
                <div className="flex items-center gap-1 w-full">
                  <input
                    type="text"
                    placeholder="domain.com"
                    value={domainInputs[i] || ""}
                    onChange={(e) =>
                      setDomainInputs((prev) => ({
                        ...prev,
                        [i]: e.target.value,
                      }))
                    }
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/70 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchLogo(i, domainInputs[i] || undefined);
                    }}
                    className="shrink-0 px-1.5 py-0.5 rounded bg-[#4361EE]/20 text-[#4361EE] text-[10px] font-medium hover:bg-[#4361EE]/30 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  >
                    Fetch logo
                  </button>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeLogo(i);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-500/80 text-white text-[8px] opacity-0 group-hover/logo:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add logo button */}
        {isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addLogo();
            }}
            className="px-4 py-2.5 rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 text-white/20 hover:text-white/40 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
          >
            + Add logo
          </button>
        )}
      </div>

      {/* ---------- Editing toolbar ---------- */}
      {isSelected && (
        <div className="flex flex-col gap-3 mt-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          {/* Columns selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium w-16 shrink-0">
              Columns
            </span>
            <div className="flex gap-1">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDataChange({ columns: n });
                  }}
                  className={`w-7 h-7 rounded text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                    data.columns === n
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Variant selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium w-16 shrink-0">
              Variant
            </span>
            <div className="flex gap-1">
              {(["default", "grayscale"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDataChange({ variant: v });
                  }}
                  className={`px-3 h-7 rounded text-xs font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                    data.variant === v
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Header presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium w-16 shrink-0">
              Header
            </span>
            <div className="flex gap-1 flex-wrap">
              {HEADER_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDataChange({ header: preset });
                  }}
                  className={`px-2.5 h-7 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                    data.header === preset
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDataChange({ header: undefined });
                }}
                className={`px-2.5 h-7 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                  !data.header
                    ? "bg-[#4361EE] text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                None
              </button>
            </div>
          </div>

          {/* Custom header input */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium w-16 shrink-0">
              Custom
            </span>
            <input
              type="text"
              placeholder="Custom header text…"
              value={
                data.header &&
                !HEADER_PRESETS.includes(
                  data.header as (typeof HEADER_PRESETS)[number]
                )
                  ? data.header
                  : ""
              }
              onChange={(e) => onDataChange({ header: e.target.value || undefined })}
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/70 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
            />
          </div>

          {/* Bulk add */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium w-16 shrink-0">
              Bulk add
            </span>
            <input
              type="text"
              placeholder="Google, Stripe, Airbnb…"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              onKeyDown={handleBulkKeyDown}
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/70 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBulkAdd();
              }}
              className="shrink-0 px-3 py-1.5 rounded bg-[#4361EE]/20 text-[#4361EE] text-xs font-medium hover:bg-[#4361EE]/30 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
            >
              Add all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
