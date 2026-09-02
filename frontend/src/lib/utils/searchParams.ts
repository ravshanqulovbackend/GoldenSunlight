import type { ProductFilters } from "@/types/product";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Next.js sahifa `searchParams`'ini (Server Component) ProductFilters'ga normallashtiradi. */
export function toProductFilters(raw: RawSearchParams): ProductFilters {
  const page = first(raw.page);
  return {
    page: page ? Number(page) : undefined,
    category__slug: first(raw.category),
    brand__slug: first(raw.brand),
    price__gte: first(raw.price_min),
    price__lte: first(raw.price_max),
    search: first(raw.search),
    ordering: first(raw.ordering),
  };
}

/**
 * Joriy URLSearchParams ustiga yangilanishlarni qo'shib, "/products?..." href qaytaradi.
 * `null` qiymat kalitni butunlay olib tashlaydi (masalan filtr tozalanganda).
 * Filtr o'zgarganda sahifa har doim 1'ga qaytariladi.
 */
export function buildProductsHref(
  current: URLSearchParams,
  updates: Record<string, string | null>
): string {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  if (!("page" in updates)) {
    next.delete("page");
  }
  const query = next.toString();
  return query ? `/products?${query}` : "/products";
}
