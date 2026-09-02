import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="label-md text-on-surface-variant">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 body-md text-on-surface",
            "focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";
