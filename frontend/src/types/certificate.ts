export interface Certificate {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  image: string;
  issued_by: string;
  issued_by_ar: string;
  issued_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
  order: number;
}

/** Admin qo'shish/tahrirlash formasi uchun — `image` faqat yangi fayl tanlanganda yuboriladi. */
export interface CertificatePayload {
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  issued_by?: string;
  issued_by_ar?: string;
  issued_date?: string | null;
  expiry_date?: string | null;
  is_active?: boolean;
  order?: number;
  image?: File;
}
