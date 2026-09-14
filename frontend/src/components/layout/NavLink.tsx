"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      // `data-active` — `.gs-underline::after` chizig'i faol havolada doim ochiq
      // turishi uchun (hover'da esa markazdan kengayadi).
      data-active={isActive}
      className={cn(
        "gs-underline gs-press label-md rounded-full px-3 py-1.5 text-on-surface hover:bg-surface-container-low hover:text-primary",
        // Chiziq havolaning px-3 padding'i ichida qolsin
        "[--gs-underline-inset:0.75rem]",
        isActive && "bg-primary/10 font-semibold text-primary",
        className
      )}
    >
      {children}
    </Link>
  );
}
