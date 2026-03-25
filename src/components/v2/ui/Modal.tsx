"use client";

import { type ReactNode, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** On mobile, render as bottom sheet instead of centered modal */
  mobileSheet?: boolean;
}

/**
 * Accessible modal with backdrop blur, scale-in animation,
 * focus trapping, and bottom-sheet mobile variant.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  mobileSheet = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleEscape]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={mobileSheet
              ? { opacity: 0, y: "100%" }
              : { opacity: 0, scale: 0.95 }
            }
            animate={mobileSheet
              ? { opacity: 1, y: 0 }
              : { opacity: 1, scale: 1 }
            }
            exit={mobileSheet
              ? { opacity: 0, y: "100%" }
              : { opacity: 0, scale: 0.95 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "relative z-10 w-full bg-[var(--surface-1)] border border-[var(--border-default)] shadow-elevation-3",
              mobileSheet
                ? "max-h-[90vh] rounded-t-2xl sm:rounded-2xl sm:max-w-lg mx-auto fixed bottom-0 sm:relative sm:bottom-auto"
                : "max-w-lg rounded-2xl mx-4",
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-desc" : undefined}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between p-5 pb-0">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-lg font-semibold text-navy dark:text-white">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-desc" className="text-sm text-navy-400 dark:text-white/50 mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors text-navy-400 dark:text-white/40"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-5 overflow-y-auto max-h-[70vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
