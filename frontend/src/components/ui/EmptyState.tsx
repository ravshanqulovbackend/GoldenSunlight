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

/** Bo'sh holat elementlari ketma-ket "ochiladi" — ikonka sakrab chiqadi, matn pastdan ko'tariladi. */
export function EmptyState({ icon = "inbox", title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Icon
        name={icon}
        className="animate-pop-in text-[48px] text-outline"
      />
      <p className="title-lg animate-fade-up text-on-surface [animation-delay:0.1s]">{title}</p>
      {description && (
        <p className="body-md max-w-sm animate-fade-up text-on-surface-variant [animation-delay:0.16s]">{description}</p>
      )}
      {actionHref && actionLabel && (
        <Link href={actionHref} className={buttonVariants("primary", "md", "mt-2 animate-fade-up [animation-delay:0.22s]")}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
