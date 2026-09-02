import { serverFetch } from "../server-fetch";
import type { Paginated } from "@/types/api";
import type { Category } from "@/types/category";

/**
 * Backend PAGE_SIZE=12 bilan qattiq belgilangan (page_size query param yo'q) — filtr
 * paneli uchun to'liq ro'yxat kerak bo'lgani sababli barcha sahifalar yig'ib olinadi.
 */
export async function getCategories(): Promise<Category[]> {
  const all: Category[] = [];
  let page = 1;
  while (true) {
    const data = await serverFetch<Paginated<Category>>("categories/", {
      searchParams: { page },
      revalidate: 300,
      tags: ["categories"],
    });
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return all;
}

export function getCategory(slug: string) {
  return serverFetch<Category>(`categories/${slug}/`, {
    revalidate: 300,
    tags: ["categories"],
  });
}
