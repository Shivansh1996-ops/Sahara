"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  showCloseButton = true,
}: ModalProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div
              className={cn(
                "relative rounded-2xl bg-[var(--card)] p-6 shadow-2xl border border-[var(--border)]",
                className
              )}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-alt)] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              
              {(title || description) && (
                <div className="mb-6">
                  {title && (
                    <h2 className="text-2xl font-serif font-semibold text-[var(--text)]">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      {description}
                    </p>
                  )}
                </div>
              )}
              
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
