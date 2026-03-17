"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered reveal for the landing Pricing section.
 * When the section enters the viewport, the three tier cards fade in and slide up with stagger
 * (Community → Pro → Fundraise) so the Pro CTA gets focused attention. Motion with purpose.
 * When prefers-reduced-motion: reduce, content is visible on first paint (no scroll needed).
 * Respects prefers-reduced-motion via globals.css for animation.
 */
export default function PricingReveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`pricing-reveal-wrapper ${inView ? "revealed" : ""}`}
    >
      {children}
    </div>
  );
}
