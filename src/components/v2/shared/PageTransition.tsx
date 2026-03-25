"use client";

import { motion } from "framer-motion";

/**
 * Wraps page content with a subtle fade-in + slide-up entrance animation.
 * Used inside v2 page components for smooth page transitions.
 */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
