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
      <Icon name="error" className="text-[48px] text-error" />
      <p className="title-lg text-on-surface">{title ?? t("errorOccurred")}</p>
      <p className="body-md max-w-sm text-on-surface-variant">{description ?? t("loadFailed")}</p>
      {onRetry && (
        <Button variant="outline" className="mt-2" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
