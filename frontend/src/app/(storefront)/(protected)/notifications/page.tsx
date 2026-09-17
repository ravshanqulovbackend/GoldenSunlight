"use client";

import { useTranslations } from "next-intl";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/query/hooks/useNotifications";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = data?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: tCommon("home"), href: "/" }, { label: t("title") }]} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="headline-md text-on-surface">{t("title")}</h1>
        {unreadCount > 0 && (
          <Button variant="outline" disabled={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            {t("markAllRead")}
          </Button>
        )}
      </div>

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
                "flex flex-col items-start justify-between gap-4 p-5 sm:flex-row",
                !notification.is_read && "border-s-4 border-s-primary"
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
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
              </div>
              {!notification.is_read && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate(notification.id)}
                  className="shrink-0"
                >
                  {t("markRead")}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
