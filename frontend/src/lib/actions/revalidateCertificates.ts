"use server";

import { revalidateTag } from "next/cache";

export async function revalidateCertificates() {
  revalidateTag("certificates", { expire: 0 });
}
