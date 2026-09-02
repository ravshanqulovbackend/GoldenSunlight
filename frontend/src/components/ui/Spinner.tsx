import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Yuklanmoqda"
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary",
        className
      )}
    />
  );
}
