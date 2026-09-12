export interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  parent: number | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  meta_title: string;
  meta_title_ar: string;
  meta_description: string;
  meta_description_ar: string;
}

/** Admin qo'shish/tahrirlash formasi uchun — `image` faqat yangi fayl tanlanganda yuboriladi. */
export interface CategoryAdminPayload {
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  parent?: number | null;
  sort_order?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_title_ar?: string;
  meta_description?: string;
  meta_description_ar?: string;
  image?: File;
}
