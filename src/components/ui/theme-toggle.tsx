"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";

interface ThemeToggleProps {
  showSystemOption?: boolean;
  className?: string;
}

export function ThemeToggle({ showSystemOption = false, className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, initialize } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();
  }, [initialize]);

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-full bg-[var(--bg-alt)] animate-pulse ${className}`} />
    );
  }

  if (showSystemOption) {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] ${className}`}>
        {[
          { value: "light" as const, icon: Sun, label: "Light" },
          { value: "system" as const, icon: Monitor, label: "System" },
          { value: "dark" as const, icon: Moon, label: "Dark" },
        ].map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`relative p-2 rounded-full transition-colors ${
              theme === value
                ? "text-[var(--primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            title={label}
          >
            {theme === value && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-[var(--card)] rounded-full shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center overflow-hidden hover:bg-[var(--card)] transition-colors group ${className}`}
      title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-5 h-5 text-[var(--primary)] group-hover:text-[var(--primary-light)]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-5 h-5 text-[var(--accent)] group-hover:text-[var(--accent-light)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}


