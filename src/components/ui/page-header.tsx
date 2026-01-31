"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  iconColor = "var(--primary)",
  actions,
  className 
}: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("px-4 pt-6 pb-4", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `color-mix(in srgb, ${iconColor} 12%, transparent)` }}
            >
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-[var(--text)] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
