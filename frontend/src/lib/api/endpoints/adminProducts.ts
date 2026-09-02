import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { Brand, ProductAdmin, ProductAdminPayload } from "@/types/product";

export interface AdminProductFilters {
  page?: number;
  search?: string;
  ordering?: string;
  category?: number;
  is_active?: boolean;
}

export async function getAdminProducts(filters: AdminProductFilters = {}): Promise<Paginated<ProductAdmin>> {
  const { data } = await http.get<Paginated<ProductAdmin>>("/products/admin/", { params: filters });
  return data;
}

export async function getAdminProduct(slug: string): Promise<ProductAdmin> {
  const { data } = await http.get<ProductAdmin>(`/products/admin/${slug}/`);
  return data;
}

/**
 * `image` fayl bo'lsa qo'shiladi, `null` bo'lsa bo'sh satr sifatida yuboriladi (DRF
 * multipart forma kiritishida bo'sh satrni `allow_null=True` maydonlar uchun `None`
 * deb qabul qiladi), `undefined` bo'lsa umuman qo'shilmaydi (maydon o'zgarishsiz qoladi).
 */
function buildProductFormData(payload: Partial<ProductAdminPayload>): FormData {
  const formData = new FormData();
  const { image, ...rest } = payload;
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    formData.append(key, value === null ? "" : String(value));
  }
  if (image) formData.append("image", image);
  return formData;
}

export async function createProduct(payload: ProductAdminPayload): Promise<ProductAdmin> {
  const { data } = await http.post<ProductAdmin>("/products/admin/", buildProductFormData(payload));
  return data;
}

export async function updateProduct(slug: string, payload: Partial<ProductAdminPayload>): Promise<ProductAdmin> {
  const { data } = await http.patch<ProductAdmin>(`/products/admin/${slug}/`, buildProductFormData(payload));
  return data;
}

export async function setProductActive(slug: string, isActive: boolean): Promise<ProductAdmin> {
  const { data } = await http.patch<ProductAdmin>(`/products/admin/${slug}/`, { is_active: isActive });
  return data;
}

export async function deleteProductPermanently(slug: string): Promise<void> {
  await http.delete(`/products/admin/${slug}/`);
}

/** Mahsulot formasidagi "Brend" select uchun — brendlar ro'yxati public, lekin bu
 * client komponentdan chaqirilgani uchun serverFetch emas, axios (`http`) ishlatiladi. */
export async function getBrandsForAdmin(): Promise<Brand[]> {
  const { data } = await http.get<Paginated<Brand>>("/products/brands/");
  return data.results;
}
