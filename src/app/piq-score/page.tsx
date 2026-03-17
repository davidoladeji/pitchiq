import type { Metadata } from "next";
import AppNav from "@/components/AppNav";
import Footer from "@/components/Footer";
import PIQScoreExplainer from "@/components/PIQScoreExplainer";

export const metadata: Metadata = {
  title: "PIQ Score \u2014 How Investors Evaluate Startups | PitchIQ",
  description:
    "Understand the 8 dimensions investors use to evaluate startups. See PIQ Score benchmarks for YC, Seed, and Pre-seed companies. Get your score today.",
};

export default function PIQScorePage() {
  return (
    <div className="min-h-screen bg-background">
      <header>
        <AppNav />
      </header>
      <main id="main" tabIndex={-1} className="pt-24" aria-label="Main content">
        <PIQScoreExplainer />
      </main>
      <Footer />
    </div>
  );
}
