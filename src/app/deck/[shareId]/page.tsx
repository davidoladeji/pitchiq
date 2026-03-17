import type { Metadata } from "next";
import DeckViewerClient from "@/components/DeckViewerClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pitch deck | PitchIQ",
  description:
    "View and share your AI-generated pitch deck. Get your PIQ Score and practice your pitch.",
};

export default function DeckViewerPage() {
  return <DeckViewerClient />;
}
