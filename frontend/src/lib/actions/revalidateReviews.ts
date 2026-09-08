"use server";

import { revalidateTag } from "next/cache";

export async function revalidateReviews(productId: number, productSlug: string) {
  revalidateTag(`reviews:${productId}`, { expire: 0 });
  revalidateTag(`product:${productSlug}`, { expire: 0 });
}
