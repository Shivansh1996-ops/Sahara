"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Home, Users, Wrench, User, Shield, LayoutDashboard } from "lucide-react";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home", requiresUnlock: false },
  { href: "/dashboard", icon: LayoutDashboard, label: "Wellness", requiresUnlock: false },
  { href: "/chat", icon: MessageCircle, label: "Luna", requiresUnlock: false },
  { href: "/tools", icon: Wrench, label: "Tools", requiresUnlock: true },
  { href: "/community", icon: Users, label: "Community", requiresUnlock: true },
  { href: "/profile", icon: User, label: "Profile", requiresUnlock: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isFullyUnlocked } = useFeatureGateStore();

  const visibleNavItems = navItems.filter(item => !item.requiresUnlock || isFullyUnlocked);

  if (visibleNavItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)] border-t border-[var(--border)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-14 rounded-lg transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-1 bg-[var(--primary)]/8 rounded-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={cn(
                  "w-5 h-5 relative z-10 transition-colors",
                  isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                )} />
                <span className={cn(
                  "text-[10px] mt-1 relative z-10 font-medium transition-colors",
                  isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
