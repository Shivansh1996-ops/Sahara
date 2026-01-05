"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, LayoutDashboard, User, Users, Dog, Brain, Target, BookOpen, MoreHorizontal } from "lucide-react";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", icon: MessageCircle, label: "Chat", requiresUnlock: false },
  { href: "/pets", icon: Dog, label: "Pets", requiresUnlock: true },
  { href: "/tools", icon: Brain, label: "Tools", requiresUnlock: true },
  { href: "/dashboard", icon: LayoutDashboard, label: "Wellness", requiresUnlock: true },
  { href: "/profile", icon: User, label: "Profile", requiresUnlock: true },
];

const moreItems = [
  { href: "/habits", icon: Target, label: "Habits" },
  { href: "/learn", icon: BookOpen, label: "Learn" },
  { href: "/assessments", icon: Brain, label: "Assess" },
  { href: "/community", icon: Users, label: "Community" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isFullyUnlocked } = useFeatureGateStore();

  // Only show bottom nav after features are unlocked
  // Before unlock, only chat is available (no nav needed)
  if (!isFullyUnlocked) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-beige-200/60 safe-area-pb"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 py-1.5 transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 rounded-lg",
                  isActive ? "text-sage-700" : "text-sage-400 hover:text-sage-600"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 w-6 h-0.5 bg-sage-600 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    aria-hidden="true"
                  />
                )}
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className={cn(
                  "text-[10px] mt-0.5",
                  isActive ? "font-semibold" : "font-medium"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
