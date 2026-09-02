import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { AdminReview } from "@/types/review";

export interface AdminReviewFilters {
  page?: number;
  search?: string;
  ordering?: string;
}

export async function getReviews(filters: AdminReviewFilters = {}): Promise<Paginated<AdminReview>> {
  const { data } = await http.get<Paginated<AdminReview>>("/reviews/admin/", { params: filters });
  return data;
}

export async function deleteReview(id: number): Promise<void> {
  await http.delete(`/reviews/admin/${id}/`);
}
