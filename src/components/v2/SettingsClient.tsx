"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import { useDashboardVersion } from "@/lib/dashboard-version";
import AppShellV2 from "./shell/AppShell";

/**
 * v2 Settings Page — wraps the existing SettingsClient in the new app shell
 * and adds a Dashboard Version preference section.
 */
import SettingsClientClassic from "@/components/SettingsClient";

interface Props {
  name: string | null;
  email: string;
  image: string | null;
  plan: string;
  brandingEnabled: boolean;
  customLogoUrl: string | null;
  customCompanyName: string | null;
  customAccentColor: string | null;
}

export default function SettingsV2(props: Props) {
  const { version, toggle, isToggling } = useDashboardVersion();

  return (
    <AppShellV2
      userName={props.name || undefined}
      userPlan={props.plan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings" },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <DashboardVersionToggle />

        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white mb-1">Settings</h1>
          <p className="text-sm text-navy-500 dark:text-white/50">Manage your account and preferences</p>
        </div>

        {/* Dashboard Version Preference */}
        <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-5">
          <h2 className="text-sm font-semibold text-navy dark:text-white mb-3">Dashboard Experience</h2>
          <p className="text-xs text-navy-500 dark:text-white/50 mb-4">
            You&apos;re currently using the <strong>{version === "new" ? "New" : "Classic"}</strong> dashboard.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { if (version !== "classic") toggle(); }}
              disabled={isToggling}
              className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                version === "classic"
                  ? "border-electric bg-electric/5"
                  : "border-[var(--border-default)] hover:border-[var(--border-emphasis)]"
              }`}
            >
              <p className="text-sm font-medium text-navy dark:text-white">Classic</p>
              <p className="text-xs text-navy-400 dark:text-white/40">The original PitchIQ layout</p>
            </button>
            <button
              onClick={() => { if (version !== "new") toggle(); }}
              disabled={isToggling}
              className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                version === "new"
                  ? "border-electric bg-electric/5"
                  : "border-[var(--border-default)] hover:border-[var(--border-emphasis)]"
              }`}
            >
              <p className="text-sm font-medium text-navy dark:text-white">New</p>
              <p className="text-xs text-navy-400 dark:text-white/40">Redesigned with sidebar navigation</p>
            </button>
          </div>
        </div>

        {/* Existing settings wrapped in surface card */}
        <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-5">
          <SettingsClientClassic {...props} />
        </div>
      </div>
    </AppShellV2>
  );
}
