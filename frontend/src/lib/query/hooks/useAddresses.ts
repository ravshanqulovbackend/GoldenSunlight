import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "@/lib/api/endpoints/addresses";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import type { AddressPayload } from "@/types/address";

export function useAddresses({ enabled = true }: { enabled?: boolean } = {}) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: getAddresses,
    enabled: enabled && isHydrated && !!access,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) => createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      toast("Address added", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AddressPayload> }) =>
      updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      toast("Address updated", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      toast("Address deleted", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}
