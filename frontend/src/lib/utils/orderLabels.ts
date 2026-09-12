"use client";

import { useTranslations } from "next-intl";
import type { OrderStatus, PaymentMethod } from "@/types/order";

/** Customer-facing status text — the backend's `status_display` is English-only
 *  ("Processing", "Preparing", ...) and not locale-aware, so the storefront uses
 *  its own translated dictionary instead. */
export function useOrderStatusLabels(): Record<OrderStatus, string> {
  const t = useTranslations("OrderStatus");
  return {
    pending: t("pending"),
    preparing: t("preparing"),
    ready: t("ready"),
    cancelled: t("cancelled"),
    refunded: t("refunded"),
  };
}

export function usePaymentMethodLabels(): Record<PaymentMethod, string> {
  const t = useTranslations("PaymentMethod");
  return { cash: t("cash"), card: t("card") };
}

export interface OrderTrackingStep {
  status: OrderStatus;
  label: string;
  icon: string;
}

/** No delivery — orders are picked up in-store, so the steps are just
 *  received -> preparing -> ready for pickup. */
export function useOrderTrackingSteps(): OrderTrackingStep[] {
  const t = useTranslations("OrderTracking");
  return [
    { status: "pending", label: t("received"), icon: "receipt_long" },
    { status: "preparing", label: t("preparing"), icon: "inventory_2" },
    { status: "ready", label: t("ready"), icon: "storefront" },
  ];
}

/** cancelled/refunded return -1 — those are shown separately (no stepper). */
export function getTrackingStepIndex(steps: OrderTrackingStep[], status: OrderStatus): number {
  return steps.findIndex((step) => step.status === status);
}
