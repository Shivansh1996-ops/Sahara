import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text)] mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-light)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--bg-alt)]",
            "hover:border-[var(--text-light)] transition-colors",
            error && "border-red-400 focus:ring-red-200 focus:border-red-400",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
