"use server";

import { revalidateTag } from "next/cache";

export async function revalidateGallery() {
  revalidateTag("gallery", { expire: 0 });
}
