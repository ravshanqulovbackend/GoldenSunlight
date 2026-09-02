import Link from "next/link";
import { Icon } from "./Icon";
import { buttonVariants } from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({ icon = "inbox", title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Icon name={icon} className="text-[48px] text-outline" />
      <p className="title-lg text-on-surface">{title}</p>
      {description && <p className="body-md max-w-sm text-on-surface-variant">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className={buttonVariants("primary", "md", "mt-2")}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
