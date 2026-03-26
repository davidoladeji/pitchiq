import DashboardVersionGate from "@/components/DashboardVersionGate";
import CreditsClassic from "./CreditsClassic";
import CreditsV2 from "@/components/v2/CreditsWrapper";

export const dynamic = "force-dynamic";

export default function CreditsPage() {
  return (
    <DashboardVersionGate
      classicComponent={<CreditsClassic />}
      newComponent={<CreditsV2 />}
    />
  );
}
