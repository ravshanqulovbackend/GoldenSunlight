import type { OrderStatus } from "@/types/order";

type Tone = "primary" | "secondary" | "tertiary" | "error" | "neutral";

const TONES: Record<OrderStatus, Tone> = {
  pending: "neutral",
  preparing: "secondary",
  ready: "primary",
  picked_up: "tertiary",
  cancelled: "error",
  refunded: "error",
};

export function orderStatusTone(status: OrderStatus): Tone {
  return TONES[status];
}
