"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import CommandPalette from "./CommandPalette";
import { ToastProvider } from "@/components/v2/ui/Toast";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userPlan?: string;
  userImage?: string;
  creditBalance?: number;
  breadcrumbs?: { label: string; href?: string }[];
  recentDecks?: { shareId: string; title: string; piqScore?: number }[];
}

export default function AppShellV2({
  children,
  userName,
  userPlan,
  userImage,
  creditBalance,
  breadcrumbs,
  recentDecks,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
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
        <CommandPalette recentDecks={recentDecks} />
      </div>
    </ToastProvider>
  );
}
