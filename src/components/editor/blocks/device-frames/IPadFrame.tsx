"use client";

import React from "react";

interface IPadFrameProps {
  children: React.ReactNode;
  color: "silver" | "space-gray";
  orientation: "portrait" | "landscape";
}

const COLOR_MAP = {
  silver: "#C0C0C0",
  "space-gray": "#3A3A3C",
} as const;

export default function IPadFrame({
  children,
  color,
  orientation,
}: IPadFrameProps) {
  const frameColor = COLOR_MAP[color];
  const isLandscape = orientation === "landscape";

  // Portrait: ~3:4 ratio (300x400), Landscape: rotated (400x300)
  const vbW = isLandscape ? 400 : 300;
  const vbH = isLandscape ? 300 : 400;

  const outerR = 24;

  // Even bezels
  const bezel = 16;
  const screenX = bezel;
  const screenY = bezel;
  const screenW = vbW - bezel * 2;
  const screenH = vbH - bezel * 2;
  const screenR = 8;

  // Camera
  const camR = 3;
  const camCx = isLandscape ? vbW / 2 : vbW / 2;
  const camCy = isLandscape ? 8 : 8;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-full"
      style={{ maxWidth: "100%", maxHeight: "100%" }}
    >
      <defs>
        <clipPath id="ipad-screen-clip">
          <rect
            x={screenX}
            y={screenY}
            width={screenW}
            height={screenH}
            rx={screenR}
            ry={screenR}
          />
        </clipPath>
      </defs>

      {/* Outer frame */}
      <rect
        x={0}
        y={0}
        width={vbW}
        height={vbH}
        rx={outerR}
        ry={outerR}
        fill={frameColor}
      />

      {/* Screen background */}
      <rect
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        rx={screenR}
        ry={screenR}
        fill="#000000"
      />

      {/* Screen content */}
      <foreignObject
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        clipPath="url(#ipad-screen-clip)"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: `${screenR}px`,
          }}
        >
          {children}
        </div>
      </foreignObject>

      {/* Camera */}
      <circle cx={camCx} cy={camCy} r={camR} fill="#1A1A1E" />
    </svg>
  );
}
