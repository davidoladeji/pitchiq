"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import SuspendedOverlay from "./SuspendedOverlay";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
        <SuspendedOverlay />
      </ThemeProvider>
    </SessionProvider>
  );
}
