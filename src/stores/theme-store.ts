"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initialize: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: "light" | "dark") => {
  if (typeof document === "undefined") return;
  
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",
      
      setTheme: (theme: Theme) => {
        const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });
      },
      
      toggleTheme: () => {
        const { theme, resolvedTheme } = get();
        // If system theme, switch to opposite of current resolved theme
        // Otherwise, toggle between light and dark
        const newTheme = theme === "system" 
          ? (resolvedTheme === "light" ? "dark" : "light")
          : (theme === "light" ? "dark" : "light");
        
        const newResolvedTheme = newTheme === "system" ? getSystemTheme() : newTheme;
        applyTheme(newResolvedTheme);
        set({ theme: newTheme, resolvedTheme: newResolvedTheme });
      },
      
      initialize: () => {
        const { theme } = get();
        const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolvedTheme);
        set({ resolvedTheme });
        
        // Listen for system theme changes
        if (typeof window !== "undefined") {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handleChange = () => {
            const { theme } = get();
            if (theme === "system") {
              const newResolvedTheme = getSystemTheme();
              applyTheme(newResolvedTheme);
              set({ resolvedTheme: newResolvedTheme });
            }
          };
          mediaQuery.addEventListener("change", handleChange);
        }
      },
    }),
    {
      name: "sahara-theme",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);


