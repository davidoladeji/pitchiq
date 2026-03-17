"use client";

import { useCallback } from "react";
import type { ImageBlockData } from "@/lib/editor/block-types";

interface ImageBlockV2Props {
  data: ImageBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<ImageBlockData>) => void;
}

export default function ImageBlockV2({
  data,
  isSelected,
  onDataChange,
}: ImageBlockV2Props) {
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDataChange({ src: e.target.value });
    },
    [onDataChange]
  );

  if (!data.src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-4">
        <svg className="w-10 h-10 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
        </svg>
        <p className="text-xs text-white/30 mb-2">No image set</p>
        {isSelected && (
          <input
            type="text"
            placeholder="Paste image URL..."
            value={data.src}
            onChange={handleUrlChange}
            className="w-full max-w-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data.src}
        alt={data.alt}
        className="w-full h-full"
        style={{ objectFit: data.fit }}
      />
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 flex gap-1">
          {(["cover", "contain", "fill"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={(e) => { e.stopPropagation(); onDataChange({ fit: f }); }}
              className={`px-2 py-0.5 text-[10px] rounded ${
                data.fit === f ? "bg-[#4361EE] text-white" : "text-white/60 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
