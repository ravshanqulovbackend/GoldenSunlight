import type { OrderStatus, PaymentMethod } from "@/types/order";

/** Mijozga ko'rinadigan holat matnlari — backend `status_display` inglizcha
 * qaytaradi ("Processing", "Preparing", ...), shuning uchun frontend'da
 * mijoz sahifalari uchun alohida o'zbekcha lug'at ishlatiladi. */
export const CUSTOMER_ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Jarayonda",
  preparing: "Tayyorlanmoqda",
  ready: "Olib ketishga tayyor",
  cancelled: "Bekor qilingan",
  refunded: "Pul qaytarilgan",
};

export const CUSTOMER_PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Naqd pul",
  card: "Plastik karta",
};

export interface OrderTrackingStep {
  status: OrderStatus;
  label: string;
  icon: string;
}

/** Yetkazib berish yo'q — buyurtma do'kondan olib ketiladi, shuning uchun
 * bosqichlar ham shunga mos: qabul qilindi -> tayyorlanmoqda -> olib ketishga tayyor. */
export const ORDER_TRACKING_STEPS: OrderTrackingStep[] = [
  { status: "pending", label: "Qabul qilindi", icon: "receipt_long" },
  { status: "preparing", label: "Tayyorlanmoqda", icon: "inventory_2" },
  { status: "ready", label: "Tayyor", icon: "storefront" },
];

/** cancelled/refunded uchun -1 qaytaradi — bular alohida (stepper'siz) ko'rsatiladi. */
export function getTrackingStepIndex(status: OrderStatus): number {
  return ORDER_TRACKING_STEPS.findIndex((step) => step.status === status);
}
