export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

/** Admin qo'shish/tahrirlash formasi uchun — `image` faqat yangi fayl tanlanganda yuboriladi. */
export interface CategoryAdminPayload {
  name: string;
  slug: string;
  description?: string;
  parent?: number | null;
  sort_order?: number;
  is_active?: boolean;
  image?: File;
}
