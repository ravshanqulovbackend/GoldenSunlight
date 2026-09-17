import type { ProductListItem } from "./product";

export type OrderStatus = "pending" | "preparing" | "ready" | "picked_up" | "cancelled" | "refunded";

/** Once an order reaches one of these, it can no longer be edited (items) and
 * dashboard revenue only ever counts `picked_up` — mirrors the backend's
 * `orders/views.py` `TERMINAL_STATUSES`. */
export const TERMINAL_ORDER_STATUSES: OrderStatus[] = ["ready", "picked_up", "cancelled", "refunded"];

export type PaymentMethod = "cash" | "card";

export interface OrderItem {
  id: number;
  product: ProductListItem | null;
  product_name: string;
  variant: number | null;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface Order {
  id: number;
  user: number;
  username: string;
  status: OrderStatus;
  status_display: string;
  full_name: string;
  phone: string;
  address: number | null;
  address_text: string;
  landmark: string;
  notes: string;
  payment_method: PaymentMethod;
  payment_display: string;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  coupon: number | null;
  tracking_number: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  /** Read-receipt for the latest order-status notification sent to the customer
   * (admin-only concern — `false`/`false` when no status-change notification has
   * been sent yet, e.g. a brand-new "pending" order). */
  notification_sent: boolean;
  notification_seen: boolean;
}

export interface CreateOrderPayload {
  full_name: string;
  phone: string;
  address_id?: number | null;
  address_text?: string;
  landmark?: string;
  notes?: string;
  payment_method: PaymentMethod;
  coupon_code?: string;
}

export interface CouponPreview {
  code: string;
  discount_percent: string;
  discount_amount: string;
  min_order_amount: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Processing",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
};
