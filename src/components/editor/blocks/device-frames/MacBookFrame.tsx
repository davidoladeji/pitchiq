"use client";

import React from "react";

interface MacBookFrameProps {
  children: React.ReactNode;
  color: "silver" | "space-gray";
}

const COLOR_MAP = {
  silver: "#C0C0C0",
  "space-gray": "#3A3A3C",
} as const;

export default function MacBookFrame({ children, color }: MacBookFrameProps) {
  const frameColor = COLOR_MAP[color];

  // ViewBox: 640 wide, 430 tall (screen portion 16:10 + base)
  const vbW = 640;
  const vbH = 430;

  // Lid / screen housing
  const lidX = 40;
  const lidY = 0;
  const lidW = 560;
  const lidH = 370;
  const lidR = 16;

  // Bezel
  const bezelTop = 24;
  const bezelSide = 12;
  const bezelBottom = 12;
  const screenX = lidX + bezelSide;
  const screenY = lidY + bezelTop;
  const screenW = lidW - bezelSide * 2;
  const screenH = lidH - bezelTop - bezelBottom;
  const screenR = 4;

  // Camera notch
  const camR = 3;
  const camCx = vbW / 2;
  const camCy = lidY + 12;

  // Base / hinge
  const baseY = lidH;
  const baseH = 14;
  const baseExtraW = 40;
  const baseX = lidX - baseExtraW / 2;
  const baseW = lidW + baseExtraW;

  // Bottom foot
  const footY = baseY + baseH;
  const footH = 6;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-full"
      style={{ maxWidth: "100%", maxHeight: "100%" }}
    >
      <defs>
        <clipPath id="macbook-screen-clip">
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

      {/* Lid */}
      <rect
        x={lidX}
        y={lidY}
        width={lidW}
        height={lidH}
        rx={lidR}
        ry={lidR}
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
        clipPath="url(#macbook-screen-clip)"
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

      {/* Hinge / base */}
      <rect
        x={baseX}
        y={baseY}
        width={baseW}
        height={baseH}
        rx={2}
        ry={2}
        fill={frameColor}
      />

      {/* Hinge line */}
      <line
        x1={baseX + 4}
        y1={baseY + 1}
        x2={baseX + baseW - 4}
        y2={baseY + 1}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={1}
      />

      {/* Bottom foot */}
      <rect
        x={baseX + 20}
        y={footY}
        width={baseW - 40}
        height={footH}
        rx={3}
        ry={3}
        fill={frameColor}
        opacity={0.6}
      />
    </svg>
  );
}
