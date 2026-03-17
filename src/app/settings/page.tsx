import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings | PitchIQ",
  description:
    "Manage your PitchIQ account, profile, plan, and branding preferences.",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      plan: true,
      brandingEnabled: true,
      customLogoUrl: true,
      customCompanyName: true,
      customAccentColor: true,
    },
  });

  return (
    <SettingsClient
      name={user?.name || null}
      email={user?.email || ""}
      image={user?.image || null}
      plan={user?.plan || "starter"}
      brandingEnabled={user?.brandingEnabled ?? true}
      customLogoUrl={user?.customLogoUrl || null}
      customCompanyName={user?.customCompanyName || null}
      customAccentColor={user?.customAccentColor || null}
    />
  );
}
