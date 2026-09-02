import Link from "next/link";
import { Icon } from "./Icon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 label-md text-on-surface-variant">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <Icon name="chevron_right" className="text-[18px] text-outline" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-primary" : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
