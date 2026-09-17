import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/types/order";

/** WhatsApp-style read receipt for the latest order-status notification sent to
 * the customer — nothing while none has been sent yet, a single gray tick once
 * sent, a double colored tick once the customer has opened it (`Order.
 * notification_seen`, set by `orders/serializers.py`). Admin-only context. */
export function NotificationSeenTicks({ order }: { order: Order }) {
  if (!order.notification_sent) return null;

  return (
    <span
      title={order.notification_seen ? "Customer has seen this status" : "Sent — not seen by the customer yet"}
      className={cn("inline-flex shrink-0 items-center", order.notification_seen ? "text-primary" : "text-on-surface-variant")}
    >
      <Icon name={order.notification_seen ? "done_all" : "done"} className="text-[18px]" />
    </span>
  );
}
