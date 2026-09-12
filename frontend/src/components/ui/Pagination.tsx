import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./Icon";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const page of sorted) {
    if (prev && page - prev > 1) result.push("ellipsis");
    result.push(page);
    prev = page;
  }
  return result;
}

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClasses = (active: boolean) =>
    cn(
      "flex h-10 w-10 items-center justify-center rounded-lg label-md transition-colors",
      active
        ? "bg-primary text-on-primary"
        : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
    );

  return (
    <nav aria-label="Sahifalash" className="flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={cn(linkClasses(false), currentPage === 1 && "pointer-events-none opacity-40")}
      >
        <Icon name="chevron_left" className="text-[20px]" mirrorInRtl />
      </Link>

      {pageNumbers(currentPage, totalPages).map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="flex h-10 w-10 items-center justify-center text-on-surface-variant">
            …
          </span>
        ) : (
          <Link key={page} href={buildHref(page)} className={linkClasses(page === currentPage)}>
            {page}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={cn(linkClasses(false), currentPage === totalPages && "pointer-events-none opacity-40")}
      >
        <Icon name="chevron_right" className="text-[20px]" mirrorInRtl />
      </Link>
    </nav>
  );
}
