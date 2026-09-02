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
        "label-md border-b-2 border-transparent pb-1 text-on-surface transition-colors hover:text-primary",
        isActive && "border-primary font-semibold text-primary"
      )}
    >
      {children}
    </Link>
  );
}
