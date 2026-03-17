"use client";

import { useCallback, useRef } from "react";
import type { DeviceMockupBlockData } from "@/lib/editor/block-types";
import IPhoneFrame from "./device-frames/IPhoneFrame";
import MacBookFrame from "./device-frames/MacBookFrame";
import IPadFrame from "./device-frames/IPadFrame";
import BrowserFrame from "./device-frames/BrowserFrame";

interface DeviceMockupBlockProps {
  data: DeviceMockupBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<DeviceMockupBlockData>) => void;
}

const DEVICE_OPTIONS: { value: DeviceMockupBlockData["device"]; label: string }[] = [
  { value: "iphone", label: "iPhone" },
  { value: "macbook", label: "MacBook" },
  { value: "ipad", label: "iPad" },
  { value: "browser", label: "Browser" },
];

const COLOR_OPTIONS: { value: DeviceMockupBlockData["colorVariant"]; label: string }[] = [
  { value: "silver", label: "Silver" },
  { value: "space-gray", label: "Space Gray" },
];

const ORIENTATION_OPTIONS: { value: DeviceMockupBlockData["orientation"]; label: string }[] = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
];

export default function DeviceMockupBlock({
  data,
  isSelected,
  onDataChange,
}: DeviceMockupBlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onDataChange({ screenshotSrc: reader.result });
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
      onDataChange({ screenshotSrc: e.target.value });
    },
    [onDataChange]
  );

  const showOrientationControls = data.device === "iphone" || data.device === "ipad";
  const showColorControls = data.device !== "browser";

  // Screen content: screenshot or upload placeholder
  const screenContent = data.screenshotSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={data.screenshotSrc}
      alt="Device screenshot"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  ) : (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.02)",
        cursor: "pointer",
        color: "rgba(255,255,255,0.3)",
        fontSize: "10px",
        textAlign: "center",
        padding: "8px",
      }}
    >
      <svg
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
        style={{ marginBottom: 4, opacity: 0.4 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
        />
      </svg>
      Drop image or click
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );

  // Render the appropriate device frame
  const renderDevice = () => {
    switch (data.device) {
      case "iphone":
        return (
          <IPhoneFrame color={data.colorVariant} orientation={data.orientation}>
            {screenContent}
          </IPhoneFrame>
        );
      case "macbook":
        return (
          <MacBookFrame color={data.colorVariant}>
            {screenContent}
          </MacBookFrame>
        );
      case "ipad":
        return (
          <IPadFrame color={data.colorVariant} orientation={data.orientation}>
            {screenContent}
          </IPadFrame>
        );
      case "browser":
        return <BrowserFrame>{screenContent}</BrowserFrame>;
      default:
        return <BrowserFrame>{screenContent}</BrowserFrame>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Device frame */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2">
        <div className="w-full h-full flex items-center justify-center">
          {renderDevice()}
        </div>
      </div>

      {/* Controls panel (when selected) */}
      {isSelected && (
        <div className="mt-3 bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-3">
          {/* Device type */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Device
            </label>
            <div className="flex gap-1">
              {DEVICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDataChange({ device: opt.value });
                  }}
                  className={`px-3 py-1 text-[11px] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none ${
                    data.device === opt.value
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color variant (hidden for browser) */}
          {showColorControls && (
            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Color
              </label>
              <div className="flex gap-1">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDataChange({ colorVariant: opt.value });
                    }}
                    className={`px-3 py-1 text-[11px] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none ${
                      data.colorVariant === opt.value
                        ? "bg-[#4361EE] text-white"
                        : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orientation (only for iphone and ipad) */}
          {showOrientationControls && (
            <div>
              <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                Orientation
              </label>
              <div className="flex gap-1">
                {ORIENTATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDataChange({ orientation: opt.value });
                    }}
                    className={`px-3 py-1 text-[11px] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none ${
                      data.orientation === opt.value
                        ? "bg-[#4361EE] text-white"
                        : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image upload / URL input */}
          <div>
            <label className="block text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
              Screenshot
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 text-[11px] rounded-md bg-white/[0.06] text-white/60 hover:bg-white/[0.1] transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none"
              >
                Upload
              </button>
              <input
                type="text"
                placeholder="Or paste image URL..."
                value={data.screenshotSrc}
                onChange={handleUrlChange}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
