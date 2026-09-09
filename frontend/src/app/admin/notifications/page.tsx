"use client";

import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/query/hooks/useNotifications";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

export default function AdminNotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = data?.results.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="headline-md text-on-surface">Notifications</h1>
          <p className="body-md text-on-surface-variant">
            Important actions performed by admins (e.g. deleting a product/category).
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" disabled={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.results.length === 0 && (
        <EmptyState icon="notifications" title="No notifications" description="There are no new notifications yet." />
      )}

      {data && data.results.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.results.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "flex flex-col items-start justify-between gap-4 p-5 sm:flex-row",
                !notification.is_read && "border-l-4 border-l-primary"
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
                  Mark as read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
