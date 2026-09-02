export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  image_count: number;
}

export interface GalleryCategoryPayload {
  name: string;
  slug: string;
}

export interface GalleryImage {
  id: number;
  title: string;
  description: string;
  image: string;
  category: number | null;
  category_name: string;
  is_featured: boolean;
  order: number;
  created_at: string;
}

/** Admin qo'shish/tahrirlash formasi uchun — `image` faqat yangi fayl tanlanganda yuboriladi. */
export interface GalleryImagePayload {
  title: string;
  description?: string;
  category?: number | null;
  is_featured?: boolean;
  order?: number;
  image?: File;
}

export interface GalleryImageFilters {
  category?: string;
}
