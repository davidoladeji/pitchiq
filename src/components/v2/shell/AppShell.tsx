"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userPlan?: string;
  userImage?: string;
  creditBalance?: number;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AppShellV2({
  children,
  userName,
  userPlan,
  userImage,
  creditBalance,
  breadcrumbs,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--surface-0)] overflow-hidden">
      <Sidebar
        userName={userName}
        userPlan={userPlan}
        userImage={userImage}
        creditBalance={creditBalance}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          breadcrumbs={breadcrumbs}
        />
        <main id="main" className="flex-1 px-4 lg:px-6 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
