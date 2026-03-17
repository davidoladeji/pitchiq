"use client";

import React from "react";

interface IPhoneFrameProps {
  children: React.ReactNode;
  color: "silver" | "space-gray";
  orientation: "portrait" | "landscape";
}

const COLOR_MAP = {
  silver: "#C0C0C0",
  "space-gray": "#3A3A3C",
} as const;

export default function IPhoneFrame({
  children,
  color,
  orientation,
}: IPhoneFrameProps) {
  const frameColor = COLOR_MAP[color];
  const isLandscape = orientation === "landscape";

  // Portrait dimensions: 187x406 viewBox (simplified 375x812)
  const vbW = isLandscape ? 406 : 187;
  const vbH = isLandscape ? 187 : 406;

  // Frame outer rect
  const outerX = 0;
  const outerY = 0;
  const outerW = isLandscape ? 406 : 187;
  const outerH = isLandscape ? 187 : 406;
  const outerR = 40;

  // Screen inner rect (inset by bezel)
  const bezel = 8;
  const screenX = bezel;
  const screenY = bezel;
  const screenW = outerW - bezel * 2;
  const screenH = outerH - bezel * 2;
  const screenR = 32;

  // Dynamic Island
  const diW = isLandscape ? 28 : 72;
  const diH = isLandscape ? 72 : 28;
  const diX = outerW / 2 - diW / 2;
  const diY = isLandscape ? outerH / 2 - diH / 2 : 16;
  const diR = 14;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-full"
      style={{ maxWidth: "100%", maxHeight: "100%" }}
    >
      <defs>
        <clipPath id="iphone-screen-clip">
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
        x={outerX}
        y={outerY}
        width={outerW}
        height={outerH}
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

      {/* Screen content via foreignObject */}
      <foreignObject
        x={screenX}
        y={screenY}
        width={screenW}
        height={screenH}
        clipPath="url(#iphone-screen-clip)"
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

      {/* Dynamic Island */}
      <rect
        x={diX}
        y={diY}
        width={diW}
        height={diH}
        rx={diR}
        ry={diR}
        fill="#000000"
      />
    </svg>
  );
}
