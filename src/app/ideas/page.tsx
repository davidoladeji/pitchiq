import IdeasPageClient from "@/components/IdeasPageClient";
import IdeasV2 from "@/components/v2/IdeasWrapper";
import DashboardVersionGate from "@/components/DashboardVersionGate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Startup idea generator | PitchIQ",
  description:
    "Answer a few questions and get AI-generated startup ideas. Turn your best idea into a pitch deck in minutes.",
};

export default function IdeasPage() {
  return (
    <DashboardVersionGate
      classicComponent={<IdeasPageClient />}
      newComponent={<IdeasV2 />}
    />
  );
}
