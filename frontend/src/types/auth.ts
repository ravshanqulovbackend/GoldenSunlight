export type UserRole = "staff" | "admin" | "superadmin";

export const ROLE_LABELS: Record<UserRole, string> = {
  staff: "Customer",
  admin: "Admin",
  superadmin: "Super Admin",
};

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar: string | null;
  role: UserRole;
  /** Django admin orqali berilgan, lekin profil to'liq to'ldirilmaguncha kuchga kirmagan rol. */
  pending_role: UserRole | "";
  is_verified: boolean;
  email_verified: boolean;
  date_of_birth: string | null;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}
