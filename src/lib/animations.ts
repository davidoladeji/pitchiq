import type { Variants } from "framer-motion";

/** Fade in from below — hidden → visible with opacity + translateY */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Stagger container — staggers children by 0.06s */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

/** Hover lift — subtle y-shift and shadow on hover */
export const hoverLift: Variants = {
  initial: { y: 0, boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)" },
  hover: {
    y: -2,
    boxShadow: "0 16px 40px rgba(17, 24, 39, 0.10)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

/** Scale in — scale from 0.95 to 1 with fade */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
