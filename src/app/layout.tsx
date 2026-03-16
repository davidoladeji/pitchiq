import type { Metadata } from "next";
import { JetBrains_Mono, Inter, Space_Grotesk, DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-space-grotesk" });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--font-dm-sans" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-plus-jakarta" });

export const metadata: Metadata = {
  metadataBase: new URL("https://getpitchiq.com"),
  title: "PitchIQ — AI-Powered Pitch Deck Generator",
  description:
    "Generate investor-ready pitch decks in 60 seconds. Open-source AI fundraising intelligence.",
  openGraph: {
    title: "PitchIQ — AI-Powered Pitch Deck Generator",
    description:
      "Generate investor-ready pitch decks in 60 seconds. Open-source AI fundraising intelligence.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PitchIQ — AI-Powered Pitch Deck Generator",
    description:
      "Generate investor-ready pitch decks in 60 seconds. Open-source AI fundraising intelligence.",
  },
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${plusJakarta.variable}`}>
      <body className="antialiased">
        {/* Skip to main — WCAG 2.1 AA; first focusable on every page */}
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-lg focus-visible:bg-electric focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
