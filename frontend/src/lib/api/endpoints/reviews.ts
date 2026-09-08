import { http } from "../http";
import { serverFetch } from "../server-fetch";
import type { Paginated } from "@/types/api";
import type { CreateReviewPayload, Review } from "@/types/review";

export function getProductReviews(productId: number) {
  return serverFetch<Paginated<Review>>(`reviews/product/${productId}/`, {
    revalidate: 30,
    tags: [`reviews:${productId}`],
  });
}

export async function createReview(productId: number, payload: Omit<CreateReviewPayload, "product">): Promise<Review> {
  const formData = new FormData();
  formData.append("product", String(productId));
  formData.append("rating", String(payload.rating));
  if (payload.comment) formData.append("comment", payload.comment);
  if (payload.image) formData.append("image", payload.image);

  const { data } = await http.post<Review>(`/reviews/product/${productId}/`, formData);
  return data;
}
