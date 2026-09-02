"use client";

import { type KeyboardEvent, type ClipboardEvent, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

interface PhoneInputProps {
  label?: string;
  error?: string;
  name?: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
}

const PREFIX = "+971 ";
const ALLOWED_KEYS = [
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Tab",
  "Home",
  "End",
  "Enter",
];

/** "501234567" -> "50 123 4567" (2-3-4 grouping, UAE mobile number format). */
function formatDigits(digits: string): string {
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)];
  return parts.filter(Boolean).join(" ");
}

/** Extracts only digits from any entered text, strips a leading "971"
 * (if the user pastes the full number), and limits it to 9 characters. */
function extractDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("971")) digits = digits.slice(3);
  return digits.slice(0, 9);
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, name, value, onChange, onBlur, className, disabled }, ref) => {
    const generatedId = useId();
    const inputId = name ?? generatedId;
    const digits = extractDigits(value ?? "");
    const displayValue = digits.length > 0 ? `${PREFIX}${formatDigits(digits)}` : "";

    const handleChange = (raw: string) => {
      const nextDigits = extractDigits(raw);
      onChange(nextDigits.length > 0 ? `+971${nextDigits}` : "");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.ctrlKey || e.metaKey || ALLOWED_KEYS.includes(e.key)) return;
      // Only digit input is allowed — letters and other extra characters are blocked.
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      handleChange(e.clipboardData.getData("text"));
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="label-md text-on-surface-variant">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          disabled={disabled}
          value={displayValue}
          placeholder="+971 50 123 4567"
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={onBlur}
          className={cn(
            "h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 body-md text-on-surface",
            "placeholder:text-on-surface-variant/40",
            "focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim",
            error && "border-error focus:border-error focus:ring-error-container",
            disabled && "cursor-not-allowed opacity-60",
            className
          )}
          aria-invalid={!!error}
        />
        {error && <span className="label-sm normal-case text-error">{error}</span>}
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";
