import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "@/components/Providers";
import { NAVY_HEX } from "@/lib/design-tokens";
import "./globals.css";

/** Mono: JetBrains Mono exposed as --font-geist-mono (design-system name). Geist Mono not in next/font/google; Geist package caused build errors, so we use JetBrains as fallback. Tailwind mono stack still lists "Geist Mono" for consistency. */
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.usepitchiq.com"),
  title: "PitchIQ — Fundraising Intelligence Platform",
  description:
    "Get your startup\u2019s PIQ Score \u2014 a 0\u2013100 fundability rating across 8 investor-grade dimensions. Measure, improve, and track your fundraising readiness.",
  keywords: [
    "pitch deck",
    "startup fundraising",
    "PIQ Score",
    "fundability",
    "investor readiness",
    "pitch deck generator",
    "AI pitch deck",
  ],
  openGraph: {
    siteName: "PitchIQ",
    title: "PitchIQ — Fundraising Intelligence Platform",
    description:
      "Get your startup\u2019s PIQ Score \u2014 a 0\u2013100 fundability rating across 8 investor-grade dimensions. Measure, improve, and track your fundraising readiness.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PitchIQ — Fundraising Intelligence Platform",
    description:
      "Get your startup\u2019s PIQ Score \u2014 a 0\u2013100 fundability rating across 8 investor-grade dimensions. Measure, improve, and track your fundraising readiness.",
  },
  themeColor: NAVY_HEX,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <body className="antialiased">
        {/* Skip to main — WCAG 2.1 AA; first focusable on every page */}
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-lg focus-visible:bg-electric focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
