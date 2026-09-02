import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavorites, removeFavorite, toggleFavorite } from "@/lib/api/endpoints/favorites";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";

export function useFavorites() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavorites,
    enabled: isHydrated && !!access,
  });
}

/**
 * The `favorited:true` response does not return the new record's id (a backend
 * limitation), so instead of an optimistic write we always refetch the list.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => toggleFavorite(productId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      toast(result.favorited ? "Added to favorites" : "Removed from favorites", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (favoriteId: number) => removeFavorite(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      toast("Removed from favorites", "success");
    },
    onError: (error) => toast(parseApiError(error).message, "error"),
  });
}
