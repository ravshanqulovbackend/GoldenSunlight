import { http } from "../http";
import type { Paginated } from "@/types/api";
import type {
  GalleryCategory,
  GalleryCategoryPayload,
  GalleryImage,
  GalleryImagePayload,
} from "@/types/gallery";

export async function getAllAdminGalleryCategories(): Promise<GalleryCategory[]> {
  const all: GalleryCategory[] = [];
  let page = 1;
  while (true) {
    const { data } = await http.get<Paginated<GalleryCategory>>("/gallery/admin/categories/", { params: { page } });
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return all;
}

export async function createGalleryCategory(payload: GalleryCategoryPayload): Promise<GalleryCategory> {
  const { data } = await http.post<GalleryCategory>("/gallery/admin/categories/", payload);
  return data;
}

export async function updateGalleryCategory(id: number, payload: Partial<GalleryCategoryPayload>): Promise<GalleryCategory> {
  const { data } = await http.patch<GalleryCategory>(`/gallery/admin/categories/${id}/`, payload);
  return data;
}

export async function deleteGalleryCategory(id: number): Promise<void> {
  await http.delete(`/gallery/admin/categories/${id}/`);
}

export async function getAllAdminGalleryImages(): Promise<GalleryImage[]> {
  const all: GalleryImage[] = [];
  let page = 1;
  while (true) {
    const { data } = await http.get<Paginated<GalleryImage>>("/gallery/admin/images/", { params: { page } });
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return all;
}

function buildGalleryImageFormData(payload: Partial<GalleryImagePayload>): FormData {
  const formData = new FormData();
  const { image, ...rest } = payload;
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    formData.append(key, value === null ? "" : String(value));
  }
  if (image) formData.append("image", image);
  return formData;
}

export async function createGalleryImage(payload: GalleryImagePayload): Promise<GalleryImage> {
  const { data } = await http.post<GalleryImage>("/gallery/admin/images/", buildGalleryImageFormData(payload));
  return data;
}

export async function updateGalleryImage(id: number, payload: Partial<GalleryImagePayload>): Promise<GalleryImage> {
  const { data } = await http.patch<GalleryImage>(`/gallery/admin/images/${id}/`, buildGalleryImageFormData(payload));
  return data;
}

export async function deleteGalleryImage(id: number): Promise<void> {
  await http.delete(`/gallery/admin/images/${id}/`);
}
