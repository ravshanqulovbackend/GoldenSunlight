import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { Category, CategoryAdminPayload } from "@/types/category";

export interface AdminCategoryFilters {
  page?: number;
  search?: string;
  ordering?: string;
}

export async function getAdminCategories(filters: AdminCategoryFilters = {}): Promise<Paginated<Category>> {
  const { data } = await http.get<Paginated<Category>>("/categories/admin/", { params: filters });
  return data;
}

/** Select/dropdown uchun — sahifalashsiz, barcha kategoriyalar (kam sonli, ~12 dan oshsa ham hammasi yig'ib olinadi). */
export async function getAllAdminCategories(): Promise<Category[]> {
  const all: Category[] = [];
  let page = 1;
  while (true) {
    const data = await getAdminCategories({ page });
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return all;
}

function buildCategoryFormData(payload: Partial<CategoryAdminPayload>): FormData {
  const formData = new FormData();
  const { image, ...rest } = payload;
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    formData.append(key, value === null ? "" : String(value));
  }
  if (image) formData.append("image", image);
  return formData;
}

export async function createCategory(payload: CategoryAdminPayload): Promise<Category> {
  const { data } = await http.post<Category>("/categories/admin/", buildCategoryFormData(payload));
  return data;
}

export async function updateCategory(slug: string, payload: Partial<CategoryAdminPayload>): Promise<Category> {
  const { data } = await http.patch<Category>(`/categories/admin/${slug}/`, buildCategoryFormData(payload));
  return data;
}

export async function setCategoryActive(slug: string, isActive: boolean): Promise<Category> {
  const { data } = await http.patch<Category>(`/categories/admin/${slug}/`, { is_active: isActive });
  return data;
}

export async function deleteCategoryPermanently(slug: string): Promise<void> {
  await http.delete(`/categories/admin/${slug}/`);
}
