"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import IdeasPageClientClassic from "@/components/IdeasPageClient";

export default function IdeasPageV2() {
  return (
    <AppShellV2
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Ideas" },
      ]}
    >
      <PageTransition>
        <div className="max-w-4xl mx-auto">
          <div className="mt-4 mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "var(--void-text, #E8E8ED)" }}>Startup Ideas</h1>
            <p className="text-sm mt-1" style={{ color: "var(--void-text-dim, rgba(255,255,255,0.3))" }}>Answer a few questions and get AI-generated startup ideas</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            <IdeasPageClientClassic />
          </div>
        </div>
      </PageTransition>
    </AppShellV2>
  );
}
