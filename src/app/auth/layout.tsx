import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | PitchIQ",
  description:
    "Sign in to PitchIQ to create pitch decks, get your PIQ Score, and practice your pitch.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
