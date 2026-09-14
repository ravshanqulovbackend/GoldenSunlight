"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { useOrderTrackingSteps, getTrackingStepIndex } from "@/lib/utils/orderLabels";
import type { OrderStatus } from "@/types/order";

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const t = useTranslations("OrderTracking");
  const steps = useOrderTrackingSteps();

  if (status === "cancelled" || status === "refunded") {
    const copy =
      status === "cancelled"
        ? { icon: "cancel", title: t("cancelledTitle"), description: t("cancelledDescription") }
        : { icon: "currency_exchange", title: t("refundedTitle"), description: t("refundedDescription") };
    return (
      <div className="flex animate-fade-up items-center gap-4 rounded-lg bg-error-container/40 p-4">
        <span className="flex h-11 w-11 shrink-0 animate-pop-in items-center justify-center rounded-full bg-error-container text-on-error-container">
          <Icon name={copy.icon} className="text-[22px]" />
        </span>
        <div>
          <p className="label-md font-semibold text-on-surface">{copy.title}</p>
          <p className="label-sm text-on-surface-variant">{copy.description}</p>
        </div>
      </div>
    );
  }

  const currentIndex = getTrackingStepIndex(steps, status);

  return (
    <div className="flex items-start">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <Fragment key={step.status}>
            <div className="flex w-20 shrink-0 flex-col items-center gap-2 text-center sm:w-28">
              <span
                className={cn(
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  "transition-[background-color,color,border-color,scale] duration-400 ease-spring",
                  (isCompleted || isCurrent) && "bg-primary text-on-primary",
                  // Joriy bosqich pulsatsiya halqasi bilan ajratiladi
                  isCurrent && "scale-110 shadow-md shadow-primary/30",
                  isUpcoming && "border border-outline-variant bg-surface-container-lowest text-on-surface-variant"
                )}
              >
                {isCurrent && (
                  <span aria-hidden className="absolute inset-0 animate-ring rounded-full border-2 border-primary" />
                )}
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
            {index < steps.length - 1 && (
              <div className="mt-[18px] h-0.5 flex-1 overflow-hidden bg-outline-variant">
                {/* Bosib o'tilgan qism chapdan o'ngga to'lib boradi */}
                <span
                  className={cn(
                    "block h-full w-full origin-left bg-primary transition-transform duration-700 ease-soft rtl:origin-right",
                    index < currentIndex ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
