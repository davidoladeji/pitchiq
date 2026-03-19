"use client";

import { SessionProvider } from "next-auth/react";
import SuspendedOverlay from "./SuspendedOverlay";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <SuspendedOverlay />
    </SessionProvider>
  );
}
