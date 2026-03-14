"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered reveal for landing section content (e.g. How it works, Features).
 * When the section enters the viewport, child items fade in and slide up with stagger.
 * Use with a wrapper that has class "section-reveal-grid"; direct children get staggered.
 * Respects prefers-reduced-motion via globals.css.
 */
export default function SectionReveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`section-reveal-wrapper ${inView ? "revealed" : ""}`}
    >
      {children}
    </div>
  );
}
