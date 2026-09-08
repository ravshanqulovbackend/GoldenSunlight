"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "label-md rounded-full px-3 py-1.5 text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary",
        isActive && "bg-primary/10 font-semibold text-primary"
      )}
    >
      {children}
    </Link>
  );
}
