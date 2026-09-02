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
  const { data } = await http.post<Review>(`/reviews/product/${productId}/`, {
    product: productId,
    ...payload,
  });
  return data;
}
