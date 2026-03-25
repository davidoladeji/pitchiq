"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

/**
 * Animated tabs with sliding underline indicator.
 * Uses Framer Motion layoutId for the indicator to smoothly
 * slide between tabs — one of the highest-ROI "wow" micro-interactions.
 */
export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const activeEl = tabRefs.current.get(activeTab);
    const container = tabsRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div ref={tabsRef} className={cn("relative flex border-b border-[var(--border-default)]", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => { if (el) tabRefs.current.set(tab.id, el); }}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "text-electric"
              : "text-navy-400 dark:text-white/40 hover:text-navy-600 dark:hover:text-white/70",
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
      {/* Animated sliding indicator */}
      <motion.div
        className="absolute bottom-0 h-0.5 bg-electric rounded-full"
        animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </div>
  );
}
