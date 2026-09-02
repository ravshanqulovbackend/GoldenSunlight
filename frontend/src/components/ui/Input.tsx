"use client";

import { type InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./Icon";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const inputId = id ?? props.name;
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="label-md text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword ? (revealed ? "text" : "password") : type}
            className={cn(
              "h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 body-md text-on-surface",
              "focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim",
              error && "border-error focus:border-error focus:ring-error-container",
              isPassword && "pr-11",
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              tabIndex={-1}
              aria-label={revealed ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <Icon name={revealed ? "visibility_off" : "visibility"} className="text-[20px]" />
            </button>
          )}
        </div>
        {error && <span className="label-sm normal-case text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
