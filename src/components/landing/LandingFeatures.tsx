"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    title: "PIQ Score",
    desc: "0\u2013100 fundability rating across 8 investor-grade dimensions with actionable coaching.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    pro: false,
  },
  {
    title: "Investor Targeting",
    desc: "Decks restructured for VC, angel, or accelerator priorities. Right story, right audience.",
    icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
    pro: false,
  },
  {
    title: "12+ Design Themes",
    desc: "Midnight, Arctic, Ember, Forest, and more. Professionally designed for every brand.",
    icon: "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z",
    pro: false,
  },
  {
    title: "View Analytics",
    desc: "Track opens, slide-level engagement, and time spent. Know when to follow up.",
    icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5s8.577 3.007 9.963 7.178c.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5s-8.577-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
    pro: true,
  },
  {
    title: "Multi-Format Export",
    desc: "Download as PDF with pixel-perfect fidelity. PPTX and Google Slides coming soon.",
    icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
    pro: false,
  },
  {
    title: "Shareable Links",
    desc: "Every deck gets a unique URL with live tracking. Share a link, not a dead PDF.",
    icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
    pro: false,
  },
];

export default function LandingFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 md:py-32 px-6 bg-gray-50/70 border-y border-gray-100">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div className="text-center mb-16">
          <p className="text-electric font-semibold text-xs uppercase tracking-[0.2em] mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-4">
            Built for fundraising, not slides
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Every feature optimized for one goal: closing investor meetings.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat, i) => (
            <div
              key={feat.title}
              className={`group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-electric/15 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: inView ? `${i * 70}ms` : "0ms" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-electric/[0.06] flex items-center justify-center shrink-0 text-electric group-hover:bg-electric group-hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-navy text-[15px] tracking-tight">{feat.title}</h3>
                    {feat.pro && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-electric/8 text-electric uppercase tracking-wider">Pro</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
