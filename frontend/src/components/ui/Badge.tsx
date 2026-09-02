import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "primary" | "secondary" | "tertiary" | "error" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "label-sm inline-flex items-center rounded-full px-3 py-1 uppercase",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
