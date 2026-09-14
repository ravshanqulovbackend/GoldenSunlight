import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/*
 * Harakat modeli: hover'da tugma bir oz ko'tariladi va soyasi chuqurlashadi,
 * bosilganda esa `.gs-press` orqali "cho'kadi".
 *
 * Tailwind v4'da `-translate-y-*` alohida `translate:` CSS xossasini, `.gs-press`
 * esa `transform:`ni o'zgartiradi — shuning uchun ikkalasi bir-birini bekor
 * qilmaydi, balki birga qo'llanadi (ilgaridagi `active:scale-[0.98]` esa
 * `.gs-press` bilan raqobatlashardi, shuning uchun olib tashlandi).
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50",
  secondary:
    "bg-secondary-container text-on-secondary-container shadow-sm hover:-translate-y-0.5 hover:brightness-95 hover:shadow-md disabled:opacity-50",
  outline:
    "border border-outline-variant text-on-surface hover:-translate-y-0.5 hover:border-primary hover:bg-surface-container-low hover:text-primary disabled:opacity-50",
  ghost: "text-on-surface hover:bg-surface-container-low disabled:opacity-50",
  danger:
    "bg-error text-on-error shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-error/25 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 label-md",
  md: "h-11 px-6 label-md",
  lg: "h-12 px-8 title-lg",
};

/** So that Button and button-styled <Link>s (e.g. EmptyState CTA) use the same classes. */
export function buttonVariants(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "gs-press inline-flex items-center justify-center gap-2 rounded-lg disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
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
