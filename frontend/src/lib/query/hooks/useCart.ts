import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, getCart, removeCartItem, updateCartItem } from "@/lib/api/endpoints/cart";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import type { AddToCartPayload } from "@/types/cart";

export function useCart() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: isHydrated && !!access,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddToCartPayload) => addToCart(payload),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart, cart);
      toast("Added to cart", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, { quantity }),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart, cart);
      toast("Removed from cart", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}
