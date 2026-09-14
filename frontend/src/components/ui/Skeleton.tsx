import { cn } from "@/lib/utils/cn";

/**
 * `animate-pulse` (butun blok o'chib-yonishi) o'rniga ustidan o'tuvchi yorug'lik
 * to'lqini — `.gs-skeleton` (globals.css). RTL'da to'lqin ham teskari yo'nalishda
 * yuradi.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("gs-skeleton rounded-lg", className)} />;
}
