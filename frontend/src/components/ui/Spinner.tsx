import { cn } from "@/lib/utils/cn";

/**
 * Aylanuvchi halqa + uning ustida sekin kengayib yo'qoluvchi "puls" to'lqini
 * (`animate-ring`) — kutish jarayoni jonliroq ko'rinadi.
 *
 * `className` faqat aylanuvchi halqaga beriladi (o'lcham shu yerda belgilanadi),
 * puls halqasi esa `absolute inset-0` orqali o'ralgan elementga moslashadi.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span role="status" aria-label="Yuklanmoqda" className="relative inline-flex">
      <span aria-hidden className="pointer-events-none absolute inset-0 animate-ring rounded-full border-2 border-primary/50" />
      <span
        aria-hidden
        className={cn("h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary", className)}
      />
    </span>
  );
}
