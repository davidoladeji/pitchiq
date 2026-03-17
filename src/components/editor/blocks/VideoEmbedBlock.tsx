"use client";

import { useCallback, useMemo } from "react";

export interface VideoEmbedBlockData {
  url: string;
  provider?: "youtube" | "vimeo" | "loom" | "figma" | "generic";
  autoplay: boolean;
  startTime?: number;
  aspectRatio: "16:9" | "4:3" | "1:1";
}

interface VideoEmbedBlockProps {
  data: VideoEmbedBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<VideoEmbedBlockData>) => void;
}

interface DetectedVideo {
  provider: VideoEmbedBlockData["provider"];
  embedUrl: string;
}

function detectProvider(
  url: string,
  autoplay: boolean,
  startTime?: number
): DetectedVideo {
  // YouTube: youtube.com/watch?v=ID or youtu.be/ID
  const ytLong = url.match(
    /(?:youtube\.com\/watch\?.*v=)([\w-]+)/
  );
  const ytShort = url.match(/youtu\.be\/([\w-]+)/);
  const ytId = ytLong?.[1] ?? ytShort?.[1];

  if (ytId) {
    let embed = `https://www.youtube.com/embed/${ytId}`;
    const params: string[] = [];
    if (autoplay) params.push("autoplay=1");
    if (startTime !== undefined) params.push(`start=${startTime}`);
    if (params.length) embed += `?${params.join("&")}`;
    return { provider: "youtube", embedUrl: embed };
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    let embed = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    if (autoplay) embed += "?autoplay=1";
    if (startTime !== undefined) {
      embed += autoplay ? "&" : "?";
      embed += `#t=${startTime}s`;
    }
    return { provider: "vimeo", embedUrl: embed };
  }

  // Loom: loom.com/share/ID
  const loomMatch = url.match(/loom\.com\/share\/([\w-]+)/);
  if (loomMatch) {
    return {
      provider: "loom",
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // Figma: figma.com/
  if (url.includes("figma.com/")) {
    return {
      provider: "figma",
      embedUrl: `https://www.figma.com/embed?embed_host=pitchiq&url=${encodeURIComponent(url)}`,
    };
  }

  // Generic fallback
  return { provider: "generic", embedUrl: url };
}

const ASPECT_PADDING: Record<VideoEmbedBlockData["aspectRatio"], string> = {
  "16:9": "56.25%",
  "4:3": "75%",
  "1:1": "100%",
};

const PROVIDER_LABELS: Record<
  NonNullable<VideoEmbedBlockData["provider"]>,
  string
> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  loom: "Loom",
  figma: "Figma",
  generic: "Embed",
};

export default function VideoEmbedBlock({
  data,
  isSelected,
  onDataChange,
}: VideoEmbedBlockProps) {
  const handleUrlInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      const { provider } = detectProvider(newUrl, false);
      onDataChange({ url: newUrl, provider });
    },
    [onDataChange]
  );

  const detected = useMemo(
    () => detectProvider(data.url, data.autoplay, data.startTime),
    [data.url, data.autoplay, data.startTime]
  );

  // ---------- Placeholder (no URL) ----------
  if (!data.url) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-6 gap-3">
        {/* Play icon */}
        <svg
          className="w-12 h-12 text-white/20"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
          <polygon points="19,15 35,24 19,33" fill="currentColor" />
        </svg>

        <p className="text-sm text-white/30">Paste a video URL</p>

        <input
          type="text"
          placeholder="https://youtube.com/watch?v=..."
          value={data.url}
          onChange={handleUrlInput}
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
        />
      </div>
    );
  }

  // ---------- Embed display ----------
  return (
    <div className="w-full h-full flex flex-col gap-0 rounded-xl overflow-hidden">
      {/* Aspect-ratio iframe container */}
      <div className="relative w-full" style={{ paddingBottom: ASPECT_PADDING[data.aspectRatio] }}>
        <iframe
          src={detected.embedUrl}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          title="Embedded video"
        />

        {/* Provider badge */}
        {detected.provider && (
          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none">
            {PROVIDER_LABELS[detected.provider]}
          </span>
        )}
      </div>

      {/* Controls (visible when selected) */}
      {isSelected && (
        <div
          className="bg-black/60 backdrop-blur-sm p-3 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* URL input */}
          <input
            type="text"
            value={data.url}
            onChange={handleUrlInput}
            placeholder="Video URL"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
          />

          <div className="flex items-center gap-3 flex-wrap">
            {/* Autoplay toggle */}
            <label className="flex items-center gap-1.5 text-[10px] text-white/60 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={data.autoplay}
                onClick={() => onDataChange({ autoplay: !data.autoplay })}
                className={`relative w-7 h-4 rounded-full transition-colors ${
                  data.autoplay ? "bg-[#4361EE]" : "bg-white/10"
                } focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    data.autoplay ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </button>
              Autoplay
            </label>

            {/* Start time */}
            <label className="flex items-center gap-1.5 text-[10px] text-white/60">
              Start (s)
              <input
                type="number"
                min={0}
                value={data.startTime ?? ""}
                onChange={(e) =>
                  onDataChange({
                    startTime: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="0"
                className="w-16 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white placeholder-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
              />
            </label>

            {/* Aspect ratio buttons */}
            <div className="flex gap-1 ml-auto">
              {(["16:9", "4:3", "1:1"] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => onDataChange({ aspectRatio: ratio })}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    data.aspectRatio === ratio
                      ? "bg-[#4361EE] text-white"
                      : "text-white/60 hover:bg-white/10"
                  } focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
