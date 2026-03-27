import React from 'react';
import { cn } from './Button';

export const Input = React.forwardRef(({ className, type, label, error, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-main)] ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-body)] px-4 py-2 text-base transition-all duration-300",
          "placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <span className="text-sm text-red-500 ml-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
