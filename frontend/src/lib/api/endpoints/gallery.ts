import { serverFetch } from "../server-fetch";
import type { Paginated } from "@/types/api";
import type { GalleryCategory, GalleryImage, GalleryImageFilters } from "@/types/gallery";

export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  const data = await serverFetch<Paginated<GalleryCategory>>("gallery/categories/", {
    revalidate: 300,
    tags: ["gallery"],
  });
  return data.results;
}

export async function getGalleryImages(filters: GalleryImageFilters = {}): Promise<GalleryImage[]> {
  const data = await serverFetch<Paginated<GalleryImage>>("gallery/images/", {
    searchParams: { ...filters },
    revalidate: 300,
    tags: ["gallery"],
  });
  return data.results;
}
