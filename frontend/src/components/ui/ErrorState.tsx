"use client";

import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const t = useTranslations("Common");
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Icon name="error" className="animate-pop-in text-[48px] text-error" />
      <p className="title-lg animate-fade-up text-on-surface [animation-delay:0.1s]">{title ?? t("errorOccurred")}</p>
      <p className="body-md max-w-sm animate-fade-up text-on-surface-variant [animation-delay:0.16s]">
        {description ?? t("loadFailed")}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-2 animate-fade-up [animation-delay:0.22s]" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
