import type { OrderStatus } from "@/types/order";

type Tone = "primary" | "secondary" | "tertiary" | "error" | "neutral";

const TONES: Record<OrderStatus, Tone> = {
  pending: "neutral",
  preparing: "secondary",
  ready: "primary",
  cancelled: "error",
  refunded: "error",
};

export function orderStatusTone(status: OrderStatus): Tone {
  return TONES[status];
}
