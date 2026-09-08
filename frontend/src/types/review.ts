export interface Review {
  id: number;
  user: number;
  user_name: string;
  product: number;
  rating: number;
  comment: string;
  image: string | null;
  created_at: string;
}

export interface CreateReviewPayload {
  product: number;
  rating: number;
  comment?: string;
  image?: File | null;
}

export interface AdminReview extends Review {
  username: string;
  product_name: string;
  product_slug: string;
}
