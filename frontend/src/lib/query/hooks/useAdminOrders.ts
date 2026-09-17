import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addOrderItem,
  getAdminOrder,
  getAdminOrders,
  notifyOrderReady,
  removeOrderItem,
  updateOrderItemQuantity,
  updateOrderStatus,
  type AdminOrderFilters,
} from "@/lib/api/endpoints/adminOrders";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import type { OrderStatus } from "@/types/order";

const ORDERS_KEY = ["admin-orders"];
const orderKey = (id: number) => ["admin-orders", id];

// Bildirishnoma "ko'rildi" belgisi (NotificationSeenTicks) mijoz o'z tomonidan
// /notifications sahifasini ochganda o'zgaradi — bu sahifada bo'lmagan holda ham
// admin buni ko'rib turishi uchun (support hooks'dagi kabi) davriy qayta so'rov.
export function useAdminOrders(filters: AdminOrderFilters = {}) {
  return useQuery({
    queryKey: [...ORDERS_KEY, filters],
    queryFn: () => getAdminOrders(filters),
    refetchInterval: 30_000,
  });
}

export function useAdminOrder(id: number) {
  return useQuery({
    queryKey: orderKey(id),
    queryFn: () => getAdminOrder(id),
    enabled: !!id,
    refetchInterval: id ? 20_000 : false,
  });
}

function useInvalidateOrder(id: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    queryClient.invalidateQueries({ queryKey: orderKey(id) });
  };
}

export function useUpdateOrderStatus(id: number) {
  const invalidate = useInvalidateOrder(id);
  return useMutation({
    mutationFn: ({ status, trackingNumber }: { status: OrderStatus; trackingNumber?: string }) =>
      updateOrderStatus(id, status, trackingNumber),
    onSuccess: () => {
      invalidate();
      toast("Status updated", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });
}

export function useUpdateOrderItemQuantity(id: number) {
  const invalidate = useInvalidateOrder(id);
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateOrderItemQuantity(id, itemId, quantity),
    onSuccess: () => {
      invalidate();
      toast("Quantity updated", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });
}

export function useRemoveOrderItem(id: number) {
  const invalidate = useInvalidateOrder(id);
  return useMutation({
    mutationFn: (itemId: number) => removeOrderItem(id, itemId),
    onSuccess: () => {
      invalidate();
      toast("Product removed", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });
}

export function useAddOrderItem(id: number) {
  const invalidate = useInvalidateOrder(id);
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      addOrderItem(id, productId, quantity),
    onSuccess: () => {
      invalidate();
      toast("Product added", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });
}

export function useNotifyOrderReady(id: number) {
  const invalidate = useInvalidateOrder(id);
  return useMutation({
    mutationFn: () => notifyOrderReady(id),
    onSuccess: () => {
      invalidate();
      toast("Order marked as ready — customer notified", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "Failed to send notification", "error"),
  });
}
