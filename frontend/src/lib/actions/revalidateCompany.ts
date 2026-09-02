"use server";

import { revalidateTag } from "next/cache";

export async function revalidateCompanyStats() {
  revalidateTag("company", { expire: 0 });
}
