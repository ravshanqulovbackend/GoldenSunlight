import type { OrderStatus } from "@/types/order";

type Tone = "primary" | "secondary" | "tertiary" | "error" | "neutral";

const TONES: Record<OrderStatus, Tone> = {
  pending: "neutral",
  confirmed: "secondary",
  processing: "secondary",
  packaging: "secondary",
  delivering: "primary",
  delivered: "primary",
  cancelled: "error",
  refunded: "error",
};

export function orderStatusTone(status: OrderStatus): Tone {
  return TONES[status];
}
