import type { ProductListItem } from "./product";

export type OrderStatus = "pending" | "preparing" | "ready" | "cancelled" | "refunded";

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
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
};
