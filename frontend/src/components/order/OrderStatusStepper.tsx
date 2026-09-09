import { Fragment } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { ORDER_TRACKING_STEPS, getTrackingStepIndex } from "@/lib/utils/orderLabels";
import type { OrderStatus } from "@/types/order";

const CANCELLED_COPY: Record<"cancelled" | "refunded", { icon: string; title: string; description: string }> = {
  cancelled: {
    icon: "cancel",
    title: "Buyurtma bekor qilingan",
    description: "Ushbu buyurtma bekor qilingan, uni endi kuzatib bo'lmaydi.",
  },
  refunded: {
    icon: "currency_exchange",
    title: "Pul qaytarilgan",
    description: "Ushbu buyurtma uchun to'langan summa qaytarilgan.",
  },
};

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "refunded") {
    const copy = CANCELLED_COPY[status];
    return (
      <div className="flex items-center gap-4 rounded-lg bg-error-container/40 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-container text-on-error-container">
          <Icon name={copy.icon} className="text-[22px]" />
        </span>
        <div>
          <p className="label-md font-semibold text-on-surface">{copy.title}</p>
          <p className="label-sm text-on-surface-variant">{copy.description}</p>
        </div>
      </div>
    );
  }

  const currentIndex = getTrackingStepIndex(status);

  return (
    <div className="flex items-start">
      {ORDER_TRACKING_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <Fragment key={step.status}>
            <div className="flex w-20 shrink-0 flex-col items-center gap-2 text-center sm:w-28">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  (isCompleted || isCurrent) && "bg-primary text-on-primary",
                  isUpcoming && "border border-outline-variant bg-surface-container-lowest text-on-surface-variant"
                )}
              >
                <Icon name={isCompleted ? "check" : step.icon} className="text-[18px]" />
              </span>
              <span
                className={cn(
                  "label-sm leading-tight",
                  isUpcoming ? "text-on-surface-variant" : "font-semibold text-on-surface"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < ORDER_TRACKING_STEPS.length - 1 && (
              <div className={cn("mt-[18px] h-0.5 flex-1", index < currentIndex ? "bg-primary" : "bg-outline-variant")} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
