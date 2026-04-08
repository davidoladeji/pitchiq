"use client";

import { createContext, useContext, useState, useCallback, useTransition } from "react";

interface DashboardVersionContextType {
  version: "classic" | "new";
  toggle: () => void;
  isToggling: boolean;
}

const DashboardVersionContext = createContext<DashboardVersionContextType>({
  version: "classic",
  toggle: () => {},
  isToggling: false,
});

export function DashboardVersionProvider({
  children,
  initialVersion,
}: {
  children: React.ReactNode;
  initialVersion: "classic" | "new";
}) {
  const [version, setVersion] = useState<"classic" | "new">(initialVersion);
  const [isPending, startTransition] = useTransition();

  const toggle = useCallback(() => {
    const next = version === "classic" ? "new" : "classic";
    setVersion(next);
    // Set cookie so server layouts read it without a DB query
    document.cookie = `dashboard_version=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    startTransition(() => {
      fetch("/api/settings/dashboard-version", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: next }),
      }).catch(() => {
        setVersion(version);
        document.cookie = `dashboard_version=${version};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      });
    });
  }, [version]);

  return (
    <DashboardVersionContext.Provider value={{ version, toggle, isToggling: isPending }}>
      {children}
    </DashboardVersionContext.Provider>
  );
}

export const useDashboardVersion = () => useContext(DashboardVersionContext);
