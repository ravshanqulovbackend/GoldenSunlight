import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Hover'da kartani ko'tarish va soyasini chuqurlashtirish (bosiladigan kartalar uchun). */
  interactive?: boolean;
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-outline-variant bg-surface-container-lowest transition-colors duration-300",
        interactive && "gs-lift hover:border-primary/40 hover:shadow-lg",
        className
      )}
      {...props}
    />
  );
}
