"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar-mockup";
import { Header } from "./header-mockup";
import { ToastProvider } from "@/components/v2/ui/toast";
import CommandPalette from "./CommandPalette";

/* ------------------------------------------------------------------ */
/*  v2 App Shell — ported from the pitchiq-dashboard-mockup            */
/* ------------------------------------------------------------------ */

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
  recentDecks,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-surface-page">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Mobile overlay sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-neutral-900/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex min-h-screen flex-col transition-[margin-left] duration-300 ease-in-out">
        <div className="page-container">
          <Header
            showMenuButton
            onMenuClick={() => setMobileMenuOpen((v) => !v)}
            userName={userName}
          />
        </div>

        <ToastProvider>
          <div className="page-container section-gap flex-1 pb-12">
            {children}
          </div>
        </ToastProvider>
      </main>

      <CommandPalette recentDecks={recentDecks} />

      {/* Dynamic margin-left based on sidebar state */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (min-width: 1024px) {
              main { margin-left: ${sidebarCollapsed ? 72 : 260}px !important; }
            }
            @media (max-width: 1023px) {
              main { margin-left: 0 !important; }
            }
          `,
        }}
      />
    </div>
  );
}
