export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  order: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price_adjustment: string;
  final_price: string;
  stock: number;
  is_active: boolean;
}

/** Backend'da average_rating maydoni model'da mavjud emas — hech qachon javobda kelmaydi, ishlatilmaydi. */
export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  old_price: string | null;
  discount_percent: number;
  image: string;
  badge: string;
  is_popular: boolean;
  is_featured: boolean;
  rating: string;
  review_count: number;
  category: number;
  category_name: string;
  brand: number | null;
  brand_name: string;
  stock: number;
  is_in_stock: boolean;
  sku: string;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  ingredients: string;
  is_active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  meta_title: string;
  meta_description: string;
  created_at: string;
}

export interface ProductRelated {
  id: number;
  name: string;
  slug: string;
  price: string;
  old_price: string | null;
  image: string;
  category_name: string;
  rating: string;
}

/**
 * `/api/products/admin/` javob shakli — public list/detail serializer'lardan ATAYLAB
 * alohida (backend'da ham shunday: `ProductAdminSerializer`). Galereya rasmlari/variantlar
 * va meta_title/meta_description ushbu bosqichda boshqarilmaydi.
 */
export interface ProductAdmin {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  old_price: string | null;
  discount_percent: number;
  image: string;
  ingredients: string;
  badge: string;
  sku: string;
  stock: number;
  is_active: boolean;
  is_popular: boolean;
  is_featured: boolean;
  rating: string;
  review_count: number;
  category: number;
  category_name: string;
  brand: number | null;
  brand_name: string;
  is_in_stock: boolean;
  created_at: string;
  updated_at: string;
}

/** Admin qo'shish/tahrirlash formasi uchun — `image` yaratishda shart, tahrirlashda ixtiyoriy. */
export interface ProductAdminPayload {
  name: string;
  slug: string;
  description?: string;
  price: string;
  old_price?: string | null;
  category: number;
  brand?: number | null;
  ingredients?: string;
  badge?: string;
  sku?: string;
  stock: number;
  is_active?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  image?: File;
}

export interface ProductFilters {
  page?: number;
  category__slug?: string;
  brand__slug?: string;
  price__gte?: string;
  price__lte?: string;
  rating__gte?: string;
  is_popular?: boolean;
  is_featured?: boolean;
  badge?: string;
  search?: string;
  ordering?: string;
}
