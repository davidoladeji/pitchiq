import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PitchIQ — AI-Powered Pitch Deck Generator",
  description:
    "Generate investor-ready pitch decks in 60 seconds. Open-source AI fundraising intelligence.",
  openGraph: {
    title: "PitchIQ — AI-Powered Pitch Deck Generator",
    description:
      "Generate investor-ready pitch decks in 60 seconds. Open-source AI fundraising intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
