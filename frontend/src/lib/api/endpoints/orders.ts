import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { CouponPreview, CreateOrderPayload, Order } from "@/types/order";

export async function getOrders(): Promise<Paginated<Order>> {
  const { data } = await http.get<Paginated<Order>>("/orders/");
  return data;
}

export async function getOrder(id: number): Promise<Order> {
  const { data } = await http.get<Order>(`/orders/${id}/`);
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await http.post<Order>("/orders/", payload);
  return data;
}

export async function cancelOrder(id: number): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/${id}/cancel/`);
  return data;
}

export async function validateCoupon(code: string): Promise<CouponPreview> {
  const { data } = await http.post<CouponPreview>("/orders/validate-coupon/", { code });
  return data;
}
