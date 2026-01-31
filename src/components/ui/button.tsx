"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-sm",
        secondary: "bg-[var(--bg-alt)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)]",
        outline: "border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5",
        ghost: "text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]",
        coral: "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] shadow-sm",
        soft: "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20",
        danger: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-emerald-500 text-white hover:bg-emerald-600",
        glass: "bg-[var(--glass-bg)] backdrop-blur-sm text-[var(--text)] hover:bg-[var(--card)] border border-[var(--border)]",
      },
      size: {
        default: "h-10 px-5 rounded-xl",
        sm: "h-8 px-4 text-xs rounded-lg",
        lg: "h-12 px-8 rounded-xl",
        xl: "h-14 px-10 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading...</span>
          </>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
