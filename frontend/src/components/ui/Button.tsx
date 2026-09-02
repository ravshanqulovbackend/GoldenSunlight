import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] disabled:opacity-50",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:brightness-95 active:scale-[0.98] disabled:opacity-50",
  outline:
    "border border-outline-variant text-on-surface hover:bg-surface-container-low active:scale-[0.98] disabled:opacity-50",
  ghost: "text-on-surface hover:bg-surface-container-low active:scale-[0.98] disabled:opacity-50",
  danger: "bg-error text-on-error hover:brightness-110 active:scale-[0.98] disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 label-md",
  md: "h-11 px-6 label-md",
  lg: "h-12 px-8 title-lg",
};

/** So that Button and button-styled <Link>s (e.g. EmptyState CTA) use the same classes. */
export function buttonVariants(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button ref={ref} className={buttonVariants(variant, size, className)} {...props} />
    );
  }
);
Button.displayName = "Button";
