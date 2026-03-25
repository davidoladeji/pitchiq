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
    startTransition(() => {
      fetch("/api/settings/dashboard-version", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: next }),
      }).catch(() => {
        setVersion(version);
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
