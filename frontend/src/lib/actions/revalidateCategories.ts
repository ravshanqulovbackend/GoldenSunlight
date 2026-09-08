"use server";

import { revalidateTag } from "next/cache";

export async function revalidateCategories() {
  revalidateTag("categories", { expire: 0 });
}
