import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | PitchIQ",
  description:
    "Manage your pitch decks, view PIQ scores, and access Pitch Practice and fundraise tools.",
};

// V2 shell is rendered by layout.tsx — this page returns null
export default function DashboardPage() {
  return null;
}
