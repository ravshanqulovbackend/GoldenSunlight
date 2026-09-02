export interface Company {
  id: number;
  name: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  founded_year: number | null;
  employee_count: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  logo: string | null;
  experience_years: string;
  product_types: string;
  export_countries: string;
  partner_stores: string;
}

/** Admin tahrirlash formasi uchun — `logo` faqat yangi fayl tanlanganda yuboriladi. */
export interface CompanyPayload {
  name?: string;
  tagline?: string;
  description?: string;
  mission?: string;
  vision?: string;
  founded_year?: number | null;
  employee_count?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  experience_years?: string;
  product_types?: string;
  export_countries?: string;
  partner_stores?: string;
  logo?: File;
}
