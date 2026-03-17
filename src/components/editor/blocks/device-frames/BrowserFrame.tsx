"use client";

import React from "react";

interface BrowserFrameProps {
  children: React.ReactNode;
}

export default function BrowserFrame({ children }: BrowserFrameProps) {
  // ViewBox: 640x420 — browser chrome at top, content area below
  const vbW = 640;
  const vbH = 420;
  const chromeH = 40;
  const outerR = 10;

  const screenY = chromeH;
  const screenW = vbW;
  const screenH = vbH - chromeH;

  // Traffic light dots
  const dotY = chromeH / 2;
  const dotR = 5;
  const dotStartX = 20;
  const dotGap = 16;

  // URL bar
  const urlBarX = 80;
  const urlBarY = 10;
  const urlBarW = vbW - 160;
  const urlBarH = 20;
  const urlBarR = 5;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-full"
      style={{ maxWidth: "100%", maxHeight: "100%" }}
    >
      <defs>
        <clipPath id="browser-content-clip">
          <rect x={0} y={screenY} width={screenW} height={screenH} />
        </clipPath>
        <clipPath id="browser-outer-clip">
          <rect
            x={0}
            y={0}
            width={vbW}
            height={vbH}
            rx={outerR}
            ry={outerR}
          />
        </clipPath>
      </defs>

      {/* Outer frame with rounded top corners */}
      <rect
        x={0}
        y={0}
        width={vbW}
        height={vbH}
        rx={outerR}
        ry={outerR}
        fill="#2A2A2E"
      />

      {/* Chrome title bar */}
      <rect x={0} y={0} width={vbW} height={chromeH} fill="#2A2A2E" clipPath="url(#browser-outer-clip)" />

      {/* Traffic light dots */}
      <circle cx={dotStartX} cy={dotY} r={dotR} fill="#FF5F57" />
      <circle cx={dotStartX + dotGap} cy={dotY} r={dotR} fill="#FFBD2E" />
      <circle cx={dotStartX + dotGap * 2} cy={dotY} r={dotR} fill="#28CA41" />

      {/* URL bar */}
      <rect
        x={urlBarX}
        y={urlBarY}
        width={urlBarW}
        height={urlBarH}
        rx={urlBarR}
        ry={urlBarR}
        fill="rgba(255,255,255,0.08)"
      />
      <text
        x={urlBarX + 10}
        y={urlBarY + urlBarH / 2 + 4}
        fill="rgba(255,255,255,0.25)"
        fontSize="10"
        fontFamily="system-ui, sans-serif"
      >
        https://
      </text>

      {/* Content background */}
      <rect x={0} y={screenY} width={screenW} height={screenH} fill="#000000" />

      {/* Content area */}
      <foreignObject
        x={0}
        y={screenY}
        width={screenW}
        height={screenH}
        clipPath="url(#browser-content-clip)"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}
