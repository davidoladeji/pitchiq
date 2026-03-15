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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
