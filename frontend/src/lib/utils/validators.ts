import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3, "At least 3 characters"),
  password: z.string().min(6, "At least 6 characters"),
  email: z.union([z.literal(""), z.string().email("Invalid email")]).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const addressSchema = z.object({
  title: z.string().optional(),
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  building: z.string().optional(),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
  is_default: z.boolean().optional(),
});
export type AddressFormValues = z.infer<typeof addressSchema>;

export const checkoutSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone number is required"),
    address_id: z.number().nullable().optional(),
    address_text: z.string().optional(),
    landmark: z.string().optional(),
    notes: z.string().optional(),
    payment_method: z.enum(["cash", "card", "click", "payme", "uzum"]),
    coupon_code: z.string().optional(),
  })
  .refine((data) => data.address_id || (data.address_text && data.address_text.trim().length > 0), {
    message: "Select an address or enter one manually",
    path: ["address_text"],
  });
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const reviewSchema = z.object({
  rating: z.number().min(1, "Select a rating").max(5),
  comment: z.string().optional(),
});
export type ReviewFormValues = z.infer<typeof reviewSchema>;

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(6, "At least 6 characters"),
    confirm_password: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((data) => data.new_password !== data.old_password, {
    message: "New password must be different from the current password",
    path: ["new_password"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const pendingRoleCompletionSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
});
export type PendingRoleCompletionFormValues = z.infer<typeof pendingRoleCompletionSchema>;

export const companyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  founded_year: z.number().nullable().optional(),
  employee_count: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("Invalid email")]).optional(),
  address: z.string().optional(),
  website: z.union([z.literal(""), z.string().url("Invalid URL")]).optional(),
  experience_years: z.string().optional(),
  product_types: z.string().optional(),
  partner_stores: z.string().optional(),
  export_countries: z.string().optional(),
});
export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const certificateFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  issued_by: z.string().optional(),
  issued_date: z.string().optional(),
  expiry_date: z.string().optional(),
  is_active: z.boolean().optional(),
  order: z.number().optional(),
});
export type CertificateFormValues = z.infer<typeof certificateFormSchema>;

export const galleryCategoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});
export type GalleryCategoryFormValues = z.infer<typeof galleryCategoryFormSchema>;

export const galleryImageFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.number().nullable().optional(),
  is_featured: z.boolean().optional(),
  order: z.number().optional(),
});
export type GalleryImageFormValues = z.infer<typeof galleryImageFormSchema>;

export const partnershipFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  company_name: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.union([z.literal(""), z.string().email("Invalid email")]).optional(),
  message: z.string().optional(),
});
export type PartnershipFormValues = z.infer<typeof partnershipFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  parent: z.number().nullable().optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  old_price: z.string().optional(),
  category: z.number({ message: "Category must be selected" }),
  brand: z.number().nullable().optional(),
  ingredients: z.string().optional(),
  badge: z.string().optional(),
  sku: z.string().optional(),
  stock: z.number({ message: "Stock quantity is required" }),
  is_active: z.boolean().optional(),
  is_popular: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});
export type ProductFormValues = z.infer<typeof productFormSchema>;
