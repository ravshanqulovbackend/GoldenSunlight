import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteReview, getReviews, type AdminReviewFilters } from "@/lib/api/endpoints/adminReviews";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";

const REVIEWS_KEY = ["admin-reviews"];

export function useReviews(filters: AdminReviewFilters = {}) {
  return useQuery({
    queryKey: [...REVIEWS_KEY, filters],
    queryFn: () => getReviews(filters),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_KEY });
      toast("Review deleted", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "Error deleting", "error"),
  });
}
