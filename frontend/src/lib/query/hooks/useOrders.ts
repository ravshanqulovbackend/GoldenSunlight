import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, createOrder, getOrder, getOrders } from "@/lib/api/endpoints/orders";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import type { CreateOrderPayload } from "@/types/order";

export function useOrders() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: getOrders,
    enabled: isHydrated && !!access,
  });
}

export function useOrder(id: number) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => getOrder(id),
    enabled: isHydrated && !!access && !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      toast("Order placed", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.setQueryData(queryKeys.order(order.id), order);
      toast("Order canceled", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}
