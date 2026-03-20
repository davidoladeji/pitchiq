import { useState, useCallback, useRef, useEffect } from "react";
import {
  Type, BarChart3, Users, Clock, Image, Quote, Grid3X3, ArrowRight,
  ChevronLeft, ChevronRight, Plus, Wand2, Layout, Palette, Settings,
  GripVertical, Trash2, Copy, Lock, MoreHorizontal, Layers,
  TrendingUp, Target, Globe, Calculator, MousePointer, Smartphone,
  Monitor, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, List, Hash, Minus, Square, Circle, Triangle,
  Play, Maximize2, Eye, Download, Share2, MessageSquare,
  CheckCircle2, XCircle, AlertCircle, Zap, Sparkles,
  PanelLeftClose, PanelLeft, Search, Command
} from "lucide-react";

// ─── Color System ───
const colors = {
  bg: "#0F0F14",
  surface: "#1A1A24",
  surfaceHover: "#22222E",
  surfaceActive: "#2A2A38",
  border: "#2E2E3E",
  borderHover: "#3E3E52",
  text: "#E8E8F0",
  textMuted: "#8888A0",
  textDim: "#5A5A72",
  accent: "#4361EE",
  accentHover: "#5A78FF",
  accentSoft: "rgba(67,97,238,0.12)",
  purple: "#7209B7",
  pink: "#F72585",
  green: "#06D6A0",
  yellow: "#FFD166",
  red: "#EF476F",
  orange: "#FF9F1C",
  canvas: "#FFFFFF",
  canvasDark: "#1E1E2A",
};

// ─── Block Types Library ───
const blockCategories = [
  {
    name: "Content",
    color: colors.accent,
    blocks: [
      { type: "heading", icon: Type, label: "Heading" },
      { type: "text", icon: AlignLeft, label: "Rich Text" },
      { type: "bullets", icon: List, label: "Bullet List" },
      { type: "callout", icon: AlertCircle, label: "Callout" },
      { type: "quote", icon: Quote, label: "Quote" },
    ],
  },
  {
    name: "Data",
    color: colors.green,
    blocks: [
      { type: "metric", icon: TrendingUp, label: "Metric" },
      { type: "metric-grid", icon: Grid3X3, label: "Metric Grid" },
      { type: "chart", icon: BarChart3, label: "Chart" },
      { type: "table", icon: Hash, label: "Table" },
      { type: "progress", icon: Target, label: "Progress" },
    ],
  },
  {
    name: "Visual",
    color: colors.purple,
    blocks: [
      { type: "image", icon: Image, label: "Image" },
      { type: "icon", icon: Sparkles, label: "Icon" },
      { type: "shape", icon: Square, label: "Shape" },
      { type: "video", icon: Play, label: "Video" },
      { type: "mockup", icon: Smartphone, label: "Mockup" },
      { type: "logos", icon: Grid3X3, label: "Logo Grid" },
    ],
  },
  {
    name: "Story",
    color: colors.orange,
    blocks: [
      { type: "timeline", icon: Clock, label: "Timeline" },
      { type: "comparison", icon: Layers, label: "Comparison" },
      { type: "process", icon: ArrowRight, label: "Process" },
      { type: "pricing", icon: Hash, label: "Pricing" },
      { type: "team", icon: Users, label: "Team" },
      { type: "funnel", icon: Triangle, label: "Funnel" },
      { type: "map", icon: Globe, label: "Map" },
    ],
  },
  {
    name: "Interactive",
    color: colors.pink,
    blocks: [
      { type: "calculator", icon: Calculator, label: "Calculator" },
      { type: "cta", icon: MousePointer, label: "CTA" },
      { type: "embed", icon: Monitor, label: "Embed" },
    ],
  },
  {
    name: "Layout",
    color: colors.textDim,
    blocks: [
      { type: "columns", icon: Layout, label: "Columns" },
      { type: "cards", icon: Grid3X3, label: "Card Group" },
      { type: "divider", icon: Minus, label: "Divider" },
      { type: "spacer", icon: Square, label: "Spacer" },
    ],
  },
];

// ─── Sample Slides ───
const sampleSlides = [
  {
    id: "1",
    name: "Title",
    layout: "centered",
    blocks: [
      { id: "b1", type: "heading", x: 1, y: 2, w: 10, h: 2, data: { text: "PitchIQ", level: "h1" } },
      { id: "b2", type: "text", x: 2, y: 4, w: 8, h: 1, data: { text: "The revolutionary pitch deck editor" } },
    ],
  },
  {
    id: "2",
    name: "Problem",
    layout: "split",
    blocks: [
      { id: "b3", type: "heading", x: 1, y: 1, w: 10, h: 1, data: { text: "The Problem", level: "h2" } },
      { id: "b4", type: "text", x: 1, y: 2, w: 5, h: 3, data: { text: "Creating pitch decks takes 40+ hours. Existing tools are either design-first or content-first — never both." } },
      { id: "b5", type: "image", x: 7, y: 2, w: 5, h: 3, data: { placeholder: true } },
    ],
  },
  {
    id: "3",
    name: "Solution",
    layout: "content",
    blocks: [
      { id: "b6", type: "heading", x: 1, y: 1, w: 10, h: 1, data: { text: "Our Solution", level: "h2" } },
      { id: "b7", type: "cards", x: 1, y: 2, w: 10, h: 3, data: { count: 3, items: ["AI Narrative", "Smart Layout", "One-Click Export"] } },
    ],
  },
  {
    id: "4",
    name: "Traction",
    layout: "data",
    blocks: [
      { id: "b8", type: "heading", x: 1, y: 1, w: 10, h: 1, data: { text: "Traction", level: "h2" } },
      { id: "b9", type: "metric-grid", x: 1, y: 2, w: 10, h: 2, data: { metrics: [
        { value: "10,247", label: "Active Users", change: "+340%", trend: "up" },
        { value: "$1.2M", label: "ARR", change: "+180%", trend: "up" },
        { value: "4.8/5", label: "Avg Rating", change: "+0.3", trend: "up" },
      ]}},
      { id: "b10", type: "chart", x: 1, y: 4, w: 10, h: 2, data: { type: "line" } },
    ],
  },
  {
    id: "5",
    name: "Team",
    layout: "team",
    blocks: [
      { id: "b11", type: "heading", x: 1, y: 1, w: 10, h: 1, data: { text: "The Team", level: "h2" } },
      { id: "b12", type: "team", x: 1, y: 2, w: 10, h: 3, data: { members: [
        { name: "David", role: "CEO", prev: ["Google", "YC"] },
        { name: "Sarah", role: "CTO", prev: ["Meta", "Stripe"] },
        { name: "James", role: "Design", prev: ["Apple", "Figma"] },
      ]}},
    ],
  },
  {
    id: "6",
    name: "Ask",
    layout: "cta",
    blocks: [
      { id: "b13", type: "heading", x: 2, y: 2, w: 8, h: 1, data: { text: "Raising $3M Seed", level: "h1" } },
      { id: "b14", type: "cta", x: 3, y: 4, w: 6, h: 1, data: { label: "Schedule a Meeting", url: "calendly.com" } },
    ],
  },
];

// ─── Narrative Analysis ───
const narrativeSteps = [
  { name: "Hook", status: "complete", slide: 1 },
  { name: "Problem", status: "complete", slide: 2 },
  { name: "Solution", status: "complete", slide: 3 },
  { name: "Traction", status: "complete", slide: 4 },
  { name: "Market", status: "missing", slide: null },
  { name: "Business Model", status: "missing", slide: null },
  { name: "Team", status: "complete", slide: 5 },
  { name: "Ask", status: "complete", slide: 6 },
];

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════

// ─── Slide Thumbnail ───
function SlideThumbnail({ slide, isActive, index, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "4px",
        background: isActive ? colors.accentSoft : "transparent",
        border: isActive ? `2px solid ${colors.accent}` : "2px solid transparent",
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{
        background: colors.canvas,
        borderRadius: 4,
        aspectRatio: "16/9",
        padding: 8,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ fontSize: 5, color: "#333", fontWeight: 700, textAlign: slide.layout === "centered" ? "center" : "left", paddingTop: slide.layout === "centered" ? 12 : 2 }}>
          {slide.blocks[0]?.data?.text || "Slide"}
        </div>
        {slide.blocks.length > 1 && (
          <div style={{ display: "flex", gap: 2, marginTop: 3, justifyContent: slide.layout === "centered" ? "center" : "flex-start" }}>
            {slide.blocks.slice(1).map((b, i) => (
              <div key={i} style={{ width: b.type === "image" ? 16 : 20, height: 8, background: b.type === "image" ? "#E0E0E0" : "#F0F0F0", borderRadius: 1 }} />
            ))}
          </div>
        )}
      </div>
      <div style={{ fontSize: 10, color: isActive ? colors.text : colors.textMuted, marginTop: 4, textAlign: "center" }}>
        {index + 1}. {slide.name}
      </div>
    </button>
  );
}

// ─── Block Renderer (Canvas) ───
function CanvasBlock({ block, isSelected, onSelect }) {
  const colW = 100 / 12;
  const left = `${block.x * colW}%`;
  const width = `${block.w * colW}%`;
  const rowH = 100 / 6;
  const top = `${block.y * rowH}%`;
  const height = `${block.h * rowH}%`;

  const renderContent = () => {
    switch (block.type) {
      case "heading":
        return (
          <div style={{
            fontSize: block.data.level === "h1" ? 28 : 22,
            fontWeight: 800,
            color: "#1A1A2E",
            textAlign: "center",
            padding: "8px 16px",
            lineHeight: 1.2,
          }}>
            {block.data.text}
          </div>
        );
      case "text":
        return (
          <div style={{ fontSize: 13, color: "#555", padding: "8px 16px", lineHeight: 1.6 }}>
            {block.data.text}
          </div>
        );
      case "image":
        return (
          <div style={{
            background: "linear-gradient(135deg, #E8EAF6, #C5CAE9)",
            borderRadius: 8,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Image size={32} color="#7986CB" />
          </div>
        );
      case "metric-grid":
        return (
          <div style={{ display: "flex", gap: 12, padding: "8px 16px", width: "100%" }}>
            {block.data.metrics.map((m, i) => (
              <div key={i} style={{
                flex: 1,
                background: "#F8F9FA",
                borderRadius: 8,
                padding: "12px 16px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E" }}>{m.value}</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: m.trend === "up" ? "#06D6A0" : "#EF476F", marginTop: 4, fontWeight: 600 }}>
                  {m.change}
                </div>
              </div>
            ))}
          </div>
        );
      case "chart":
        return (
          <div style={{ padding: "8px 16px", width: "100%", height: "100%" }}>
            <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: colors.accent, stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: colors.accent, stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path d="M0,100 C50,90 80,85 120,70 C160,55 200,60 240,40 C280,20 320,25 360,10 L400,5 L400,120 L0,120Z" fill="url(#chartGrad)" />
              <path d="M0,100 C50,90 80,85 120,70 C160,55 200,60 240,40 C280,20 320,25 360,10 L400,5" fill="none" stroke={colors.accent} strokeWidth="2.5" />
              {[0, 120, 240, 360].map((x, i) => (
                <line key={i} x1={x} y1="0" x2={x} y2="120" stroke="#E0E0E0" strokeWidth="0.5" strokeDasharray="4,4" />
              ))}
            </svg>
          </div>
        );
      case "cards":
        return (
          <div style={{ display: "flex", gap: 12, padding: "8px 16px", width: "100%" }}>
            {block.data.items.map((item, i) => (
              <div key={i} style={{
                flex: 1,
                background: "#F8F9FA",
                borderRadius: 8,
                padding: "16px",
                textAlign: "center",
                border: "1px solid #E8E8E8",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: [colors.accent, colors.purple, colors.green][i],
                  margin: "0 auto 8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {[<Zap key={0} size={16} color="#fff" />, <Layout key={1} size={16} color="#fff" />, <Download key={2} size={16} color="#fff" />][i]}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E" }}>{item}</div>
              </div>
            ))}
          </div>
        );
      case "team":
        return (
          <div style={{ display: "flex", gap: 16, padding: "8px 16px", width: "100%", justifyContent: "center" }}>
            {block.data.members.map((m, i) => (
              <div key={i} style={{ textAlign: "center", width: 90 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${[colors.accent, colors.purple, colors.green][i]}, ${[colors.accentHover, colors.pink, colors.yellow][i]})`,
                  margin: "0 auto 6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: "#fff", fontWeight: 700,
                }}>
                  {m.name[0]}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1A2E" }}>{m.name}</div>
                <div style={{ fontSize: 9, color: "#888" }}>{m.role}</div>
                <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 4 }}>
                  {m.prev.map((p, j) => (
                    <span key={j} style={{
                      fontSize: 7, background: "#E8EAF6", color: "#5C6BC0",
                      padding: "1px 4px", borderRadius: 3, fontWeight: 600,
                    }}>ex-{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case "cta":
        return (
          <div style={{ textAlign: "center", padding: "12px 16px" }}>
            <button style={{
              background: colors.accent,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}>
              {block.data.label}
            </button>
            <div style={{ fontSize: 10, color: "#888", marginTop: 6 }}>{block.data.url}</div>
          </div>
        );
      default:
        return <div style={{ padding: 8, color: "#888", fontSize: 11 }}>{block.type} block</div>;
    }
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
      style={{
        position: "absolute",
        left, top, width, height,
        border: isSelected ? `2px solid ${colors.accent}` : "2px solid transparent",
        borderRadius: 4,
        cursor: "pointer",
        transition: "border-color 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {isSelected && (
        <>
          {/* Resize handles */}
          {["top-left", "top-right", "bottom-left", "bottom-right"].map(pos => (
            <div key={pos} style={{
              position: "absolute",
              width: 8, height: 8,
              background: colors.accent,
              borderRadius: 2,
              border: "2px solid #fff",
              [pos.includes("top") ? "top" : "bottom"]: -4,
              [pos.includes("left") ? "left" : "right"]: -4,
              zIndex: 20,
            }} />
          ))}
          {/* Action bar */}
          <div style={{
            position: "absolute",
            top: -36,
            left: "50%",
            transform: "translateX(-50%)",
            background: colors.surface,
            borderRadius: 8,
            padding: "4px 6px",
            display: "flex",
            gap: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            zIndex: 30,
          }}>
            {[GripVertical, Copy, Wand2, Trash2, MoreHorizontal].map((Icon, i) => (
              <button key={i} style={{
                background: "transparent",
                border: "none",
                padding: 4,
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                color: i === 2 ? colors.accent : colors.textMuted,
              }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </>
      )}
      {renderContent()}
    </div>
  );
}

// ─── Design Score ───
function DesignScore({ score }) {
  const color = score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: `conic-gradient(${color} ${score * 3.6}deg, ${colors.surfaceActive} 0deg)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: colors.surface,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, color,
        }}>
          {score}
        </div>
      </div>
      <span style={{ fontSize: 10, color: colors.textMuted }}>Design Score</span>
    </div>
  );
}

// ─── Narrative Arc ───
function NarrativeArc({ steps, activeSlide }) {
  return (
    <div style={{ padding: "12px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: colors.text, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={14} color={colors.accent} />
        Narrative Arc
      </div>
      {steps.map((step, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "4px 0",
          opacity: step.status === "missing" ? 0.5 : 1,
        }}>
          {step.status === "complete" ? (
            <CheckCircle2 size={14} color={colors.green} />
          ) : (
            <XCircle size={14} color={colors.red} />
          )}
          <span style={{ fontSize: 11, color: step.status === "complete" ? colors.text : colors.red, flex: 1 }}>
            {step.name}
          </span>
          {step.slide && (
            <span style={{ fontSize: 9, color: colors.textDim, background: colors.surfaceActive, padding: "1px 6px", borderRadius: 4 }}>
              #{step.slide}
            </span>
          )}
          {step.status === "missing" && (
            <button style={{
              fontSize: 9, color: colors.accent, background: colors.accentSoft,
              border: "none", padding: "2px 8px", borderRadius: 4, cursor: "pointer",
            }}>
              + Add
            </button>
          )}
        </div>
      ))}
      <div style={{
        marginTop: 10, padding: "8px 10px",
        background: "rgba(255,209,102,0.08)",
        borderRadius: 6,
        border: `1px solid rgba(255,209,102,0.2)`,
        fontSize: 10, color: colors.yellow, lineHeight: 1.5,
      }}>
        Missing Market Size and Business Model slides. Investors will ask about these.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function PitchIQEditor() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("blocks");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [audienceMode, setAudienceMode] = useState("investor");

  const activeSlide = sampleSlides[activeSlideIndex];

  const blockPanelContent = (
    <div style={{ padding: 12 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: colors.surfaceActive, borderRadius: 8,
        padding: "6px 10px", marginBottom: 12,
      }}>
        <Search size={14} color={colors.textDim} />
        <span style={{ fontSize: 11, color: colors.textDim }}>Search blocks... or type /</span>
      </div>
      {blockCategories.map((cat) => (
        <div key={cat.name} style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: cat.color,
            textTransform: "uppercase", letterSpacing: 1,
            marginBottom: 6, padding: "0 4px",
          }}>
            {cat.name}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {cat.blocks.map((block) => (
              <button
                key={block.type}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "1px solid transparent",
                  borderRadius: 6, padding: "6px 8px", cursor: "pointer",
                  color: colors.textMuted, fontSize: 11, textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = colors.surfaceHover;
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.text;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.color = colors.textMuted;
                }}
              >
                <block.icon size={14} />
                {block.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const propertiesContent = selectedBlockId ? (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: colors.text, marginBottom: 12 }}>Block Properties</div>
      {/* Position */}
      <div style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", marginBottom: 6 }}>Position</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
        {["X", "Y", "W", "H"].map((label) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: colors.textDim, width: 14 }}>{label}</span>
            <div style={{
              flex: 1, background: colors.surfaceActive, borderRadius: 4,
              padding: "4px 8px", fontSize: 11, color: colors.text,
            }}>
              {Math.floor(Math.random() * 8 + 1)}
            </div>
          </div>
        ))}
      </div>
      {/* Style */}
      <div style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", marginBottom: 6 }}>Style</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[colors.accent, colors.purple, colors.pink, colors.green, colors.yellow, "#333", "#888", "#FFF"].map((c) => (
          <div key={c} style={{
            width: 20, height: 20, borderRadius: 4,
            background: c, cursor: "pointer",
            border: c === "#FFF" ? `1px solid ${colors.border}` : "none",
          }} />
        ))}
      </div>
      {/* Typography */}
      <div style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", marginBottom: 6 }}>Typography</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
          <button key={i} style={{
            background: i === 0 ? colors.accentSoft : "transparent",
            border: "none", borderRadius: 4, padding: 4,
            cursor: "pointer", color: i === 0 ? colors.accent : colors.textMuted, display: "flex",
          }}>
            <Icon size={14} />
          </button>
        ))}
      </div>
      {/* Shadow */}
      <div style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", marginBottom: 6, marginTop: 12 }}>Shadow</div>
      <div style={{ display: "flex", gap: 4 }}>
        {["None", "SM", "MD", "LG"].map((s, i) => (
          <button key={s} style={{
            flex: 1, fontSize: 10, padding: "4px 0",
            background: i === 0 ? colors.accentSoft : "transparent",
            color: i === 0 ? colors.accent : colors.textMuted,
            border: `1px solid ${i === 0 ? colors.accent : colors.border}`,
            borderRadius: 4, cursor: "pointer",
          }}>
            {s}
          </button>
        ))}
      </div>
      {/* AI */}
      <div style={{
        marginTop: 16, padding: 10,
        background: colors.accentSoft,
        borderRadius: 8,
        border: `1px solid rgba(67,97,238,0.2)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Wand2 size={14} color={colors.accent} />
          <span style={{ fontSize: 11, fontWeight: 700, color: colors.accent }}>AI Actions</span>
        </div>
        {["Enhance content", "Suggest layout", "Rewrite punchier", "Expand details"].map((action) => (
          <button key={action} style={{
            display: "block", width: "100%", textAlign: "left",
            background: "transparent", border: "none",
            padding: "4px 0", fontSize: 10, color: colors.textMuted,
            cursor: "pointer",
          }}>
            {action}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <div style={{ padding: 20, textAlign: "center", color: colors.textDim, fontSize: 11 }}>
      Select a block to edit properties
    </div>
  );

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: colors.bg,
      color: colors.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* ─── Top Toolbar ─── */}
      <div style={{
        height: 48,
        background: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: "#fff",
          }}>P</div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>PitchIQ</span>
        </div>

        <div style={{ width: 1, height: 20, background: colors.border }} />

        {/* Deck name */}
        <span style={{ fontSize: 12, color: colors.textMuted }}>Series A Deck</span>

        <div style={{ flex: 1 }} />

        {/* Audience toggle */}
        <div style={{
          display: "flex", background: colors.surfaceActive, borderRadius: 6,
          padding: 2, gap: 1,
        }}>
          {["investor", "customer", "partner"].map((mode) => (
            <button
              key={mode}
              onClick={() => setAudienceMode(mode)}
              style={{
                background: audienceMode === mode ? colors.accent : "transparent",
                color: audienceMode === mode ? "#fff" : colors.textMuted,
                border: "none", borderRadius: 4, padding: "3px 10px",
                fontSize: 10, fontWeight: 600, cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: colors.border }} />

        <DesignScore score={78} />

        <div style={{ width: 1, height: 20, background: colors.border }} />

        {/* Actions */}
        <button style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "transparent", border: `1px solid ${colors.border}`,
          borderRadius: 6, padding: "4px 10px", cursor: "pointer",
          color: colors.textMuted, fontSize: 11,
        }}>
          <Share2 size={14} /> Share
        </button>
        <button style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "transparent", border: `1px solid ${colors.border}`,
          borderRadius: 6, padding: "4px 10px", cursor: "pointer",
          color: colors.textMuted, fontSize: 11,
        }}>
          <Download size={14} /> Export
        </button>
        <button style={{
          display: "flex", alignItems: "center", gap: 4,
          background: colors.accent, border: "none",
          borderRadius: 6, padding: "4px 14px", cursor: "pointer",
          color: "#fff", fontSize: 11, fontWeight: 600,
        }}>
          <Play size={14} /> Present
        </button>
      </div>

      {/* ─── Main Area ─── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Panel - Slides */}
        {showLeftPanel && (
          <div style={{
            width: 160,
            background: colors.surface,
            borderRight: `1px solid ${colors.border}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}>
            <div style={{
              padding: "10px 12px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>Slides</span>
              <button style={{
                background: colors.accentSoft, border: "none", borderRadius: 4,
                padding: 3, cursor: "pointer", display: "flex", color: colors.accent,
              }}>
                <Plus size={14} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {sampleSlides.map((slide, i) => (
                <SlideThumbnail
                  key={slide.id}
                  slide={slide}
                  index={i}
                  isActive={i === activeSlideIndex}
                  onClick={() => { setActiveSlideIndex(i); setSelectedBlockId(null); }}
                />
              ))}
              {/* Add slide button */}
              <button style={{
                width: "100%", padding: 8,
                border: `2px dashed ${colors.border}`,
                borderRadius: 8, background: "transparent",
                cursor: "pointer", color: colors.textDim,
                fontSize: 10, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 4,
              }}>
                <Plus size={12} /> Add Slide
              </button>
            </div>
          </div>
        )}

        {/* Toggle panel button */}
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          style={{
            position: "absolute",
            left: showLeftPanel ? 160 : 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 50,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderLeft: "none",
            borderRadius: "0 6px 6px 0",
            padding: "8px 2px",
            cursor: "pointer",
            color: colors.textMuted,
            display: "flex",
          }}
        >
          {showLeftPanel ? <PanelLeftClose size={12} /> : <PanelLeft size={12} />}
        </button>

        {/* ─── Canvas Area ─── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          background: colors.bg,
          position: "relative",
        }}
          onClick={() => setSelectedBlockId(null)}
        >
          {/* Grid toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowGrid(!showGrid); }}
            style={{
              position: "absolute", top: 12, right: 12,
              background: showGrid ? colors.accentSoft : colors.surface,
              border: `1px solid ${showGrid ? colors.accent : colors.border}`,
              borderRadius: 6, padding: "4px 8px",
              cursor: "pointer", color: showGrid ? colors.accent : colors.textMuted,
              fontSize: 10, display: "flex", alignItems: "center", gap: 4, zIndex: 5,
            }}
          >
            <Grid3X3 size={12} /> Grid
          </button>

          {/* Slide navigation */}
          <button
            onClick={(e) => { e.stopPropagation(); setActiveSlideIndex(Math.max(0, activeSlideIndex - 1)); }}
            style={{
              position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
              background: colors.surface, border: `1px solid ${colors.border}`,
              borderRadius: 6, padding: 6, cursor: "pointer", color: colors.textMuted, display: "flex", zIndex: 5,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setActiveSlideIndex(Math.min(sampleSlides.length - 1, activeSlideIndex + 1)); }}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: colors.surface, border: `1px solid ${colors.border}`,
              borderRadius: 6, padding: 6, cursor: "pointer", color: colors.textMuted, display: "flex", zIndex: 5,
            }}
          >
            <ChevronRight size={16} />
          </button>

          {/* The canvas */}
          <div style={{
            width: "100%",
            maxWidth: 800,
            aspectRatio: "16/9",
            background: colors.canvas,
            borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* 12-column grid overlay */}
            {showGrid && (
              <div style={{
                position: "absolute", inset: 0,
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: 0,
                pointerEvents: "none",
                zIndex: 0,
              }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{
                    borderLeft: `1px solid rgba(67,97,238,0.08)`,
                    borderRight: i === 11 ? `1px solid rgba(67,97,238,0.08)` : "none",
                    height: "100%",
                  }} />
                ))}
              </div>
            )}

            {/* Blocks */}
            {activeSlide.blocks.map((block) => (
              <CanvasBlock
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={setSelectedBlockId}
              />
            ))}

            {/* Slide counter */}
            <div style={{
              position: "absolute", bottom: 8, right: 12,
              fontSize: 10, color: "#CCC",
            }}>
              {activeSlideIndex + 1} / {sampleSlides.length}
            </div>
          </div>
        </div>

        {/* ─── Right Panel ─── */}
        <div style={{
          width: 260,
          background: colors.surface,
          borderLeft: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            borderBottom: `1px solid ${colors.border}`,
          }}>
            {[
              { id: "blocks", icon: Plus, label: "Blocks" },
              { id: "properties", icon: Settings, label: "Properties" },
              { id: "ai", icon: Wand2, label: "AI" },
              { id: "theme", icon: Palette, label: "Theme" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "8px 4px",
                  background: sidebarTab === tab.id ? colors.surfaceActive : "transparent",
                  border: "none",
                  borderBottom: sidebarTab === tab.id ? `2px solid ${colors.accent}` : "2px solid transparent",
                  cursor: "pointer",
                  color: sidebarTab === tab.id ? colors.accent : colors.textDim,
                  fontSize: 9,
                  fontWeight: 600,
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {sidebarTab === "blocks" && blockPanelContent}
            {sidebarTab === "properties" && propertiesContent}
            {sidebarTab === "ai" && <NarrativeArc steps={narrativeSteps} activeSlide={activeSlideIndex} />}
            {sidebarTab === "theme" && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.text, marginBottom: 12 }}>Theme</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", marginBottom: 6 }}>Color Palette</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
                  {[
                    { name: "Midnight", colors: ["#1A1A2E", "#4361EE", "#E8E8F0", "#F8F9FA"] },
                    { name: "Ocean", colors: ["#0A2647", "#2C74B3", "#E8F1F5", "#F5FBFF"] },
                    { name: "Forest", colors: ["#1B4332", "#52B788", "#D8F3DC", "#F7FCF9"] },
                    { name: "Sunset", colors: ["#3D0C11", "#D63230", "#FFE8D6", "#FFF8F0"] },
                  ].map((palette) => (
                    <button key={palette.name} style={{
                      background: "transparent", border: `1px solid ${colors.border}`,
                      borderRadius: 6, padding: 4, cursor: "pointer",
                    }}>
                      <div style={{ display: "flex", gap: 1, marginBottom: 3 }}>
                        {palette.colors.map((c, i) => (
                          <div key={i} style={{ flex: 1, height: 12, background: c, borderRadius: i === 0 ? "3px 0 0 3px" : i === 3 ? "0 3px 3px 0" : 0 }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 8, color: colors.textMuted, textAlign: "center" }}>{palette.name}</div>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: colors.textDim, textTransform: "uppercase", marginBottom: 6 }}>Font Pair</div>
                {[
                  { heading: "Inter", body: "Inter", sample: "Aa" },
                  { heading: "Playfair", body: "Source Sans", sample: "Aa" },
                  { heading: "Montserrat", body: "Open Sans", sample: "Aa" },
                ].map((font) => (
                  <button key={font.heading} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "6px 8px", marginBottom: 4,
                    background: "transparent", border: `1px solid ${colors.border}`,
                    borderRadius: 6, cursor: "pointer", color: colors.text, textAlign: "left",
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 700, width: 28 }}>{font.sample}</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>{font.heading}</div>
                      <div style={{ fontSize: 9, color: colors.textMuted }}>{font.body}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div style={{
        height: 32,
        background: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 16,
        fontSize: 10,
        color: colors.textDim,
        flexShrink: 0,
      }}>
        <span>Slide {activeSlideIndex + 1} of {sampleSlides.length}</span>
        <span>{activeSlide.blocks.length} blocks</span>
        <span>Layout: {activeSlide.layout}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Command size={10} /> <span>K to search</span>
        </div>
        <span style={{ color: colors.green }}>Saved</span>
      </div>
    </div>
  );
}
