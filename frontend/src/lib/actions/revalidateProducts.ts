"use server";

import { revalidateTag } from "next/cache";

export async function revalidateProducts(slug?: string) {
  revalidateTag("products", { expire: 0 });
  if (slug) revalidateTag(`product:${slug}`, { expire: 0 });
}
