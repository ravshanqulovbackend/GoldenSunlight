export interface Certificate {
  id: number;
  title: string;
  description: string;
  image: string;
  issued_by: string;
  issued_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
  order: number;
}

/** Admin qo'shish/tahrirlash formasi uchun — `image` faqat yangi fayl tanlanganda yuboriladi. */
export interface CertificatePayload {
  title: string;
  description?: string;
  issued_by?: string;
  issued_date?: string | null;
  expiry_date?: string | null;
  is_active?: boolean;
  order?: number;
  image?: File;
}
