"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMarkAllNotificationsRead, useNotifications } from "@/lib/query/hooks/useNotifications";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

export default function NotificationsPage() {
  const t = useTranslations("Notifications");
  const tCommon = useTranslations("Common");
  const { data, isLoading, isError, refetch } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  // WhatsApp-style read receipt: opening this page IS "viewing" the notification —
  // there's no separate "mark as read" click. This is what flips an admin's order
  // detail page from a single gray tick to a double colored one
  // (`NotificationSeenTicks`, via `Order.notification_seen`).
  useEffect(() => {
    if (data?.some((n) => !n.is_read) && !markAllRead.isPending) {
      markAllRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: tCommon("home"), href: "/" }, { label: t("title") }]} />

      <h1 className="mt-4 headline-md text-on-surface">{t("title")}</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState icon="notifications" title={t("emptyTitle")} description={t("emptyDescription")} />
      )}

      {data && data.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {data.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "flex items-start gap-3 p-5",
                !notification.is_read && "border-s-4 border-s-primary"
              )}
            >
              <span
                className={cn(
                  "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  notification.is_read
                    ? "bg-surface-container-high text-on-surface-variant"
                    : "bg-primary-container text-on-primary-container"
                )}
              >
                <Icon name="notifications" className="text-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="label-md font-semibold text-on-surface">{notification.title}</p>
                <p className="body-md text-on-surface-variant">{notification.message}</p>
                <p className="label-sm mt-1 text-on-surface-variant">{formatDate(notification.created_at)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
