import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="label-md text-on-surface-variant">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            "rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 body-md text-on-surface",
            "focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim",
            error && "border-error focus:border-error focus:ring-error-container",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <span className="label-sm normal-case text-error">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
