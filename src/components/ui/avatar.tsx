"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  seed?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const colors = [
  "bg-sage-200 text-sage-700",
  "bg-beige-300 text-beige-700",
  "bg-soft-blue-200 text-soft-blue-700",
  "bg-sage-300 text-sage-800",
  "bg-beige-200 text-beige-600",
];

function getColorFromSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const words = name.split(/(?=[A-Z])|[\s_-]+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, seed = "default", size = "md", ...props }, ref) => {
    const colorClass = getColorFromSeed(seed);
    const initials = getInitials(seed);

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium",
          sizeClasses[size],
          colorClass,
          className
        )}
        {...props}
      >
        {initials}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
