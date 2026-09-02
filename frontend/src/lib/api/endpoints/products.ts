import { serverFetch } from "../server-fetch";
import type { Paginated } from "@/types/api";
import type {
  Brand,
  ProductDetail,
  ProductFilters,
  ProductListItem,
  ProductRelated,
} from "@/types/product";

export function getProducts(filters: ProductFilters = {}) {
  return serverFetch<Paginated<ProductListItem>>("products/", {
    searchParams: { ...filters },
    revalidate: 30,
    tags: ["products"],
  });
}

export function getProduct(slug: string) {
  return serverFetch<ProductDetail>(`products/${slug}/`, {
    revalidate: 30,
    tags: ["products", `product:${slug}`],
  });
}

export function getRelatedProducts(slug: string) {
  return serverFetch<ProductRelated[]>(`products/${slug}/related/`, {
    revalidate: 60,
    tags: ["products"],
  });
}

export function getPopularProducts() {
  return serverFetch<ProductListItem[]>("products/popular/", {
    revalidate: 60,
    tags: ["products"],
  });
}

export function getFeaturedProducts() {
  return serverFetch<ProductListItem[]>("products/featured/", {
    revalidate: 60,
    tags: ["products"],
  });
}

export function getNewProducts() {
  return serverFetch<ProductListItem[]>("products/new/", {
    revalidate: 60,
    tags: ["products"],
  });
}

export function getBrands() {
  return serverFetch<Paginated<Brand>>("products/brands/", {
    revalidate: 300,
    tags: ["brands"],
  });
}
