"use client";

import { SlideData } from "@/lib/types";
import { getTheme, ThemeDef } from "@/lib/themes";
import { useState, useEffect, useCallback, useImperativeHandle, forwardRef, CSSProperties } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";

interface SlideRendererProps {
  slides: SlideData[];
  companyName: string;
  showBranding?: boolean;
  themeId?: string;
}

const CHART_COLORS = ["#4361ee", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

/** Convert hex color to rgba string — html2canvas-safe replacement for color-mix() */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function themeVars(theme: ThemeDef): CSSProperties {
  return {
    "--t-bg-dark": theme.bgDark,
    "--t-bg-light": theme.bgLight,
    "--t-text": theme.textPrimary,
    "--t-text-secondary": theme.textSecondary,
    "--t-accent": theme.accent,
    "--t-accent-light": theme.accentLight,
    "--t-card-bg": theme.cardBg,
    "--t-heading-font": theme.headingFont,
    "--t-heading-weight": String(theme.headingWeight),
  } as CSSProperties;
}

const headingStyle: CSSProperties = {
  fontFamily: "var(--t-heading-font)",
  fontWeight: "var(--t-heading-weight)" as unknown as number,
};

function TitleSlide({ slide, companyName, accentHex }: { slide: SlideData; companyName: string; accentHex?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full p-8 md:p-10 lg:p-12 relative overflow-hidden"
      style={{ background: "var(--t-bg-dark)", color: "var(--t-text)" }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-15" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[220px] rounded-full blur-[90px] opacity-20"
        style={{ background: "var(--t-accent)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        <div className="mb-6 md:mb-8">
          <CompanyLogo companyName={companyName} size={56} accentColor={accentHex || "#4361ee"} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 tracking-tight leading-[1.1]" style={headingStyle}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl leading-relaxed opacity-70" style={{ color: "var(--t-text-secondary)" }}>
            {slide.subtitle}
          </p>
        )}
        <div className="space-y-2 max-w-xl">
          {slide.content.map((item, i) => (
            <p key={i} className="text-sm sm:text-base leading-relaxed opacity-50" style={{ color: "var(--t-text-secondary)" }}>
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentSlide({ slide, accent }: { slide: SlideData; accent?: boolean }) {
  const layout = slide.layout || "default";
  const bg = accent ? "var(--t-bg-dark)" : "var(--t-bg-light)";
  const fg = accent ? "var(--t-text)" : "var(--t-bg-dark)";
  const accentColor = accent ? "var(--t-accent-light)" : "var(--t-accent)";
  const subColor = accent ? "var(--t-text-secondary)" : undefined;
  const items = slide.content.slice(0, 6);

  const header = (className?: string) => (
    <div className={className || "mb-4 md:mb-6 relative z-10 shrink-0"}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2 text-balance" style={headingStyle}>{slide.title}</h2>
      {slide.subtitle && (
        <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-60" style={{ color: subColor }}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );

  if (layout === "centered") {
    return (
      <div className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative overflow-hidden" style={{ background: bg, color: fg }}>
        {accent && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
        {accent && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${accent ? "var(--t-accent)" : "var(--t-accent)"}, transparent)` }} />}
        <div className="text-center mb-6 relative z-10 shrink-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2" style={headingStyle}>{slide.title}</h2>
          {slide.subtitle && <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-60 max-w-2xl mx-auto" style={{ color: subColor }}>{slide.subtitle}</p>}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10 items-center">
          {items.map((item, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{ background: accent ? "var(--t-card-bg)" : "rgba(0,0,0,0.02)", borderTop: `3px solid ${accentColor}` }}>
              <p className="text-sm sm:text-base leading-relaxed opacity-90">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "split") {
    return (
      <div className="flex flex-col h-full relative overflow-hidden" style={{ background: bg, color: fg }}>
        {accent && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
        <div className="flex-1 grid grid-cols-[2fr_3fr] relative z-10">
          <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12" style={{ borderRight: `1px solid ${accent ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}` }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-3" style={headingStyle}>{slide.title}</h2>
            {slide.subtitle && <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-60" style={{ color: subColor }}>{slide.subtitle}</p>}
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10 space-y-2.5">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: accent ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)" }}>
                <span className="w-1.5 rounded-full mt-1.5 shrink-0 min-h-[1.25rem]" style={{ background: accentColor }} aria-hidden="true" />
                <p className="text-sm sm:text-base leading-relaxed opacity-90">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (layout === "two-column") {
    return (
      <div className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative overflow-hidden" style={{ background: bg, color: fg }}>
        {accent && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
        {header()}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-2 gap-x-6 gap-y-2.5 relative z-10 items-start content-center">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: accent ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)" }}>
              <span className="w-1.5 rounded-full mt-1.5 shrink-0 min-h-[1rem]" style={{ background: accentColor }} aria-hidden="true" />
              <p className="text-sm sm:text-base leading-relaxed opacity-90">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "stat-highlight" && items.length > 1) {
    return (
      <div className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative overflow-hidden" style={{ background: bg, color: fg }}>
        {accent && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
        {header()}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center relative z-10">
          <div className="mb-6 p-6 rounded-xl" style={{ background: accent ? "var(--t-card-bg)" : "rgba(0,0,0,0.02)", borderLeft: `4px solid ${accentColor}` }}>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug" style={{ color: accentColor }}>{items[0]}</p>
          </div>
          <div className="space-y-3">
            {items.slice(1).map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1 rounded-full mt-2 shrink-0 min-h-[1rem]" style={{ background: accentColor }} aria-hidden="true" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-90">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative overflow-hidden" style={{ background: bg, color: fg }}>
      {accent && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      {accent && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accentColor }} aria-hidden="true" />}
      {header()}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center space-y-3 md:space-y-4 relative z-10 max-w-3xl">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 md:gap-4">
            <span className="w-1 rounded-full mt-2 shrink-0 min-h-[1rem]" style={{ background: accentColor }} aria-hidden="true" />
            <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-90">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsSlide({ slide, accent }: { slide: SlideData; accent?: boolean }) {
  return (
    <div
      className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative overflow-hidden"
      style={{
        background: accent ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: accent ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {accent && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      <div className="mb-6 md:mb-8 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2 text-balance" style={headingStyle}>{slide.title}</h2>
        {slide.subtitle && (
          <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-60" style={{ color: accent ? "var(--t-text-secondary)" : undefined }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 items-stretch relative z-10">
        {slide.content.map((item, i) => (
          <div
            key={i}
            className="p-4 md:p-6 rounded-xl flex items-center"
            style={{
              background: accent ? "var(--t-card-bg)" : "var(--t-bg-light)",
              border: accent ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed opacity-90">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartSlide({ slide, accent }: { slide: SlideData; accent?: boolean }) {
  const chart = slide.chartData;
  const isDark = !!accent;

  return (
    <div
      className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative"
      style={{
        background: isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: isDark ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {isDark && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      <div className="mb-4 md:mb-6 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2 text-balance" style={headingStyle}>{slide.title}</h2>
        {slide.subtitle && (
          <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-60" style={{ color: isDark ? "var(--t-text-secondary)" : undefined }}>
            {slide.subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 relative z-10 min-h-0">
        {chart?.data?.length ? (
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === "pie" ? (
              <PieChart>
                <Pie
                  data={chart.data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  innerRadius="40%"
                  paddingAngle={3}
                  label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}%`}
                  labelLine={true}
                >
                  {chart.data.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: isDark ? "rgba(15,23,42,0.95)" : "#fff",
                    border: "1px solid rgba(128,128,128,0.2)",
                    borderRadius: "8px",
                    color: isDark ? "#fff" : "#0f172a",
                    fontSize: "13px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }} />
              </PieChart>
            ) : chart.type === "line" ? (
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"} />
                <XAxis dataKey="label" tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: chart.label || "", angle: -90, position: "insideLeft", fill: isDark ? "rgba(255,255,255,0.5)" : "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: isDark ? "rgba(15,23,42,0.95)" : "#fff", border: "1px solid rgba(128,128,128,0.2)", borderRadius: "8px", color: isDark ? "#fff" : "#0f172a", fontSize: "13px" }} />
                <Line type="monotone" dataKey="value" stroke="#4361ee" strokeWidth={3} dot={{ fill: "#4361ee", r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            ) : chart.type === "area" ? (
              <AreaChart data={chart.data}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4361ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"} />
                <XAxis dataKey="label" tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: chart.label || "", angle: -90, position: "insideLeft", fill: isDark ? "rgba(255,255,255,0.5)" : "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: isDark ? "rgba(15,23,42,0.95)" : "#fff", border: "1px solid rgba(128,128,128,0.2)", borderRadius: "8px", color: isDark ? "#fff" : "#0f172a", fontSize: "13px" }} />
                <Area type="monotone" dataKey="value" stroke="#4361ee" strokeWidth={3} fill="url(#areaGrad)" dot={{ fill: "#4361ee", r: 4 }} />
              </AreaChart>
            ) : (
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"} />
                <XAxis dataKey="label" tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: chart.label || "", angle: -90, position: "insideLeft", fill: isDark ? "rgba(255,255,255,0.5)" : "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: isDark ? "rgba(15,23,42,0.95)" : "#fff", border: "1px solid rgba(128,128,128,0.2)", borderRadius: "8px", color: isDark ? "#fff" : "#0f172a", fontSize: "13px" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chart.data.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          /* Fallback to text content when no chart data */
          <div className="space-y-3">
            {slide.content.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1 rounded-full mt-2 shrink-0 min-h-[1rem]" style={{ background: isDark ? "var(--t-accent-light)" : "var(--t-accent)" }} aria-hidden="true" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-90">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricsSlide({ slide, accent }: { slide: SlideData; accent?: boolean }) {
  const isDark = !!accent;
  const metricsData = (slide.metrics || []).slice(0, 6);

  return (
    <div
      className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative overflow-hidden"
      style={{
        background: isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: isDark ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {isDark && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      <div className="mb-6 md:mb-8 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2 text-balance" style={headingStyle}>{slide.title}</h2>
        {slide.subtitle && (
          <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-60" style={{ color: isDark ? "var(--t-text-secondary)" : undefined }}>
            {slide.subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 md:gap-4 items-stretch relative z-10">
        {metricsData.length > 0
          ? metricsData.map((metric, i) => (
              <div
                key={i}
                className="p-4 md:p-6 rounded-xl flex flex-col justify-center"
                style={{
                  background: isDark ? "var(--t-card-bg)" : "rgba(0,0,0,0.02)",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <p className="text-[11px] md:text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">{metric.label}</p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: isDark ? "var(--t-text)" : "var(--t-bg-dark)" }}>
                  {metric.value}
                </p>
                {metric.change && (
                  <p className={`text-xs md:text-sm font-semibold mt-1 ${metric.trend === "up" ? "text-emerald-400" : metric.trend === "down" ? "text-red-400" : isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {metric.trend === "up" ? "\u2191" : metric.trend === "down" ? "\u2193" : "\u2192"} {metric.change}
                  </p>
                )}
              </div>
            ))
          : slide.content.map((item, i) => (
              <div
                key={i}
                className="p-4 md:p-6 rounded-xl flex items-center"
                style={{
                  background: isDark ? "var(--t-card-bg)" : "rgba(0,0,0,0.02)",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed opacity-90">{item}</p>
              </div>
            ))}
      </div>
    </div>
  );
}

function TeamSlide({ slide }: { slide: SlideData }) {
  const teamData = slide.team || [];

  return (
    <div className="flex flex-col h-full p-8 md:p-10 lg:p-12" style={{ background: "var(--t-bg-light)", color: "var(--t-bg-dark)" }}>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2 text-balance" style={headingStyle}>{slide.title}</h2>
        {slide.subtitle && <p className="text-sm sm:text-base md:text-lg opacity-60 leading-relaxed">{slide.subtitle}</p>}
      </div>

      <div className={`flex-1 grid gap-4 items-stretch ${teamData.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
        {teamData.length > 0
          ? teamData.map((member, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 md:p-5 rounded-xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg md:text-xl"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                >
                  {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <p className="font-bold text-sm md:text-base">{member.name}</p>
                <p className="text-xs md:text-sm font-medium opacity-60" style={{ color: "var(--t-accent)" }}>{member.role}</p>
                {member.bio && <p className="text-xs opacity-50 mt-2 leading-relaxed line-clamp-2">{member.bio}</p>}
              </div>
            ))
          : slide.content.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>
                  {item.charAt(0)}
                </div>
                <p className="text-sm md:text-base font-medium">{item}</p>
              </div>
            ))}
      </div>
    </div>
  );
}

function TimelineSlide({ slide, accentHex = "#4361ee" }: { slide: SlideData; accentHex?: string }) {
  const timelineData = (slide.timeline || []).slice(0, 5);
  const isDark = !!slide.accent;

  return (
    <div
      className="flex flex-col h-full p-8 md:p-10 lg:p-12 overflow-hidden"
      style={{
        background: isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: isDark ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {isDark && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      <div className="mb-4 md:mb-6 shrink-0 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2 text-balance" style={headingStyle}>{slide.title}</h2>
        {slide.subtitle && <p className="text-sm sm:text-base md:text-lg opacity-60 leading-relaxed" style={{ color: isDark ? "var(--t-text-secondary)" : undefined }}>{slide.subtitle}</p>}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center relative z-10">
        {timelineData.length > 0 ? (
          <div className="relative">
            <div className="absolute left-[18px] top-2 bottom-2 w-0.5" style={{ background: hexToRgba(accentHex, 0.25) }} />

            <div className="space-y-3 md:space-y-4">
              {timelineData.map((item, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: item.completed ? "#34d399" : accentHex,
                      background: item.completed ? "rgba(52,211,153,0.1)" : hexToRgba(accentHex, 0.1),
                    }}
                  >
                    {item.completed ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: accentHex }} />
                    )}
                  </div>
                  <div className="pt-1 min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accentHex }}>{item.date}</p>
                    <p className="font-bold text-sm md:text-base">{item.title}</p>
                    {item.description && <p className="text-xs md:text-sm opacity-60 mt-0.5">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {slide.content.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1 rounded-full mt-2 shrink-0 min-h-[1rem]" style={{ background: accentHex }} aria-hidden="true" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-90">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonSlide({ slide, accentHex = "#4361ee" }: { slide: SlideData; accentHex?: string }) {
  const items = slide.content.slice(0, 6);
  return (
    <div className="flex flex-col h-full p-8 md:p-10 lg:p-12 overflow-hidden" style={{ background: "var(--t-bg-light)", color: "var(--t-bg-dark)" }}>
      <div className="mb-4 md:mb-6 shrink-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mb-2 text-balance" style={headingStyle}>{slide.title}</h2>
        {slide.subtitle && <p className="text-sm sm:text-base md:text-lg opacity-60 leading-relaxed">{slide.subtitle}</p>}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center space-y-2 md:space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 md:p-4 rounded-xl" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)" }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: hexToRgba(accentHex, 0.1), border: `1px solid ${hexToRgba(accentHex, 0.2)}` }}
              aria-hidden="true"
            >
              <span className="font-bold text-xs" style={{ color: accentHex }}>{i + 1}</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed pt-1">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaSlide({ slide, companyName, accentHex }: { slide: SlideData; companyName: string; accentHex?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full p-8 md:p-10 lg:p-12 relative overflow-hidden"
      style={{ background: "var(--t-bg-dark)", color: "var(--t-text)" }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-15" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[220px] rounded-full blur-[90px] opacity-15"
        style={{ background: "var(--t-accent)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 tracking-tight leading-tight text-balance" style={headingStyle}>{slide.title}</h2>
        {slide.subtitle && (
          <p className="text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-60" style={{ color: "var(--t-text-secondary)" }}>
            {slide.subtitle}
          </p>
        )}
        <div className="space-y-2 md:space-y-3 mb-8 max-w-xl">
          {slide.content.map((item, i) => (
            <p key={i} className="text-sm sm:text-base md:text-lg leading-relaxed opacity-50" style={{ color: "var(--t-text-secondary)" }}>
              {item}
            </p>
          ))}
        </div>
        <CompanyLogo companyName={companyName} size={44} accentColor={accentHex || "#4361ee"} />
      </div>
    </div>
  );
}

function renderSlide(slide: SlideData, companyName: string, accentHex?: string) {
  switch (slide.type) {
    case "title":
      return <TitleSlide slide={slide} companyName={companyName} accentHex={accentHex} />;
    case "chart":
      return <ChartSlide slide={slide} accent={slide.accent} />;
    case "metrics":
      return <MetricsSlide slide={slide} accent={slide.accent} />;
    case "team":
      return <TeamSlide slide={slide} />;
    case "timeline":
      return <TimelineSlide slide={slide} accentHex={accentHex} />;
    case "stats":
      return <StatsSlide slide={slide} accent={slide.accent} />;
    case "comparison":
      return <ComparisonSlide slide={slide} accentHex={accentHex} />;
    case "cta":
      return <CtaSlide slide={slide} companyName={companyName} accentHex={accentHex} />;
    default:
      return <ContentSlide slide={slide} accent={slide.accent} />;
  }
}

export interface SlideRendererHandle {
  getAllSlidesContainer: () => HTMLDivElement | null;
}

const SlideRenderer = forwardRef<SlideRendererHandle, SlideRendererProps>(function SlideRenderer({ slides, companyName, showBranding = true, themeId }, ref) {
  const theme = getTheme(themeId || "midnight");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const allSlidesRef = useCallback((node: HTMLDivElement | null) => {
    allSlidesContainerRef.current = node;
  }, []);
  const allSlidesContainerRef = { current: null as HTMLDivElement | null };

  useImperativeHandle(ref, () => ({
    getAllSlidesContainer: () => document.getElementById("pdf-slides-container") as HTMLDivElement | null,
  }));

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length && index !== currentSlide && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    [slides.length, currentSlide, isTransitioning]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(currentSlide - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goTo(currentSlide + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, goTo]);

  return (
    <div className="relative" style={themeVars(theme)}>
      {/* Hidden container with all slides for PDF export */}
      <div
        id="pdf-slides-container"
        ref={allSlidesRef}
        className="absolute left-[-9999px] top-0"
        style={themeVars(theme)}
        aria-hidden="true"
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-[1280px] h-[720px] relative overflow-hidden" style={themeVars(theme)}>
            {renderSlide(slide, companyName, theme.accent)}
            {showBranding && (
              <div className="absolute bottom-3 left-4 text-[10px] opacity-25 font-medium tracking-wide" style={{ color: (slide.type === "title" || slide.type === "cta" || slide.accent) ? "var(--t-text)" : "var(--t-bg-dark)" }}>
                Made with PitchIQ
              </div>
            )}
            <div className="absolute bottom-3 right-4 text-xs opacity-30 font-medium font-mono tracking-wider" style={{ color: (slide.type === "title" || slide.type === "cta" || slide.accent) ? "var(--t-text)" : "var(--t-bg-dark)" }}>
              {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>

      <div id="slide-container" className="relative aspect-[16/9] w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-premium-lg border border-gray-200/50">
        <div className={`absolute inset-0 transition-opacity duration-300 ease-out ${isTransitioning ? "opacity-90" : "opacity-100"}`}>
          {renderSlide(slides[currentSlide], companyName, theme.accent)}
        </div>

        <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 text-xs md:text-sm opacity-30 font-medium font-mono tracking-wider">
          {String(currentSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>

        {showBranding && (
          <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-[10px] md:text-xs opacity-25 font-medium tracking-wide">
            Made with PitchIQ
          </div>
        )}

        <button onClick={() => goTo(currentSlide - 1)} className="absolute left-0 top-0 w-1/4 h-full cursor-w-resize opacity-0 hover:opacity-100 transition-opacity" aria-label="Previous slide">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>
        <button onClick={() => goTo(currentSlide + 1)} className="absolute right-0 top-0 w-1/4 h-full cursor-e-resize opacity-0 hover:opacity-100 transition-opacity" aria-label="Next slide">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6" role="group" aria-label="Slide navigation">
        <button onClick={() => goTo(currentSlide - 1)} disabled={currentSlide === 0} className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white border border-gray-200 text-navy disabled:opacity-25 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2" aria-label="Previous slide">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-1.5 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 ${
                i === currentSlide ? "bg-navy w-6 h-2.5" : "bg-gray-200 hover:bg-gray-300 w-2.5 h-2.5"
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentSlide ? "true" : undefined}
            />
          ))}
        </div>

        <button onClick={() => goTo(currentSlide + 1)} disabled={currentSlide === slides.length - 1} className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white border border-gray-200 text-navy disabled:opacity-25 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2" aria-label="Next slide">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-3 hidden md:block">
        Use <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-mono">&larr;</kbd>{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-mono">&rarr;</kbd> to navigate
      </p>
    </div>
  );
});

export default SlideRenderer;
