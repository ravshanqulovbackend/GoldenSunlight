import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { Order, OrderStatus } from "@/types/order";

export interface AdminOrderFilters {
  page?: number;
  search?: string;
  status?: OrderStatus | "";
}

export async function getAdminOrders(filters: AdminOrderFilters = {}): Promise<Paginated<Order>> {
  const { status, ...rest } = filters;
  const { data } = await http.get<Paginated<Order>>("/orders/admin/orders/", {
    params: { ...rest, status: status || undefined },
  });
  return data;
}

export async function getAdminOrder(id: number): Promise<Order> {
  const { data } = await http.get<Order>(`/orders/admin/orders/${id}/`);
  return data;
}

export async function updateOrderStatus(id: number, status: OrderStatus, trackingNumber?: string): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/admin/orders/${id}/status/`, {
    status,
    ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
  });
  return data;
}

export async function updateOrderItemQuantity(orderId: number, itemId: number, quantity: number): Promise<Order> {
  const { data } = await http.patch<Order>(`/orders/admin/orders/${orderId}/items/${itemId}/`, { quantity });
  return data;
}

export async function removeOrderItem(orderId: number, itemId: number): Promise<Order> {
  const { data } = await http.delete<Order>(`/orders/admin/orders/${orderId}/items/${itemId}/`);
  return data;
}

export async function addOrderItem(orderId: number, productId: number, quantity: number): Promise<Order> {
  const { data } = await http.post<Order>(`/orders/admin/orders/${orderId}/items/`, {
    product_id: productId,
    quantity,
  });
  return data;
}

export async function notifyOrderReady(orderId: number): Promise<{ detail: string }> {
  const { data } = await http.post<{ detail: string }>(`/orders/admin/orders/${orderId}/notify-ready/`);
  return data;
}
