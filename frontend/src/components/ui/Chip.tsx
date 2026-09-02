import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** Clickable toggle chip for the filter panel (weight, category, etc.). */
export function Chip({ className, selected, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "label-md rounded-lg border px-4 py-2 transition-colors",
        selected
          ? "border-primary bg-primary-container text-on-primary-container"
          : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
        className
      )}
      aria-pressed={selected}
      {...props}
    />
  );
}
