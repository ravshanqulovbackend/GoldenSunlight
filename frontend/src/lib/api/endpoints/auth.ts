import { http } from "../http";
import type {
  AuthTokens,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  User,
} from "@/types/auth";

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await http.post<AuthTokens>("/users/login/", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await http.post<RegisterResponse>("/users/register/", payload);
  return data;
}

export async function fetchProfile(): Promise<User> {
  const { data } = await http.get<User>("/users/profile/");
  return data;
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  const { data } = await http.patch<User>("/users/profile/", payload);
  return data;
}

interface ProfileMultipartPayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: File;
}

/**
 * Avatar fayli bilan profil yangilash uchun — oddiy `updateProfile` JSON yuboradi,
 * fayl esa faqat multipart/form-data orqali yuborilishi mumkin. Content-Type
 * ATAYLAB qo'lda qo'yilmaydi — FormData berilganda brauzer/axios boundary
 * parametrini o'zi to'g'ri hisoblab qo'yadi.
 */
export async function updateProfileMultipart(payload: ProfileMultipartPayload): Promise<User> {
  const formData = new FormData();
  if (payload.first_name !== undefined) formData.append("first_name", payload.first_name);
  if (payload.last_name !== undefined) formData.append("last_name", payload.last_name);
  if (payload.phone !== undefined) formData.append("phone", payload.phone);
  if (payload.avatar) formData.append("avatar", payload.avatar);

  const { data } = await http.patch<User>("/users/profile/", formData);
  return data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ detail: string }> {
  const { data } = await http.post<{ detail: string }>("/users/change-password/", payload);
  return data;
}

export async function logoutRequest(refresh: string): Promise<void> {
  await http.post("/users/logout/", { refresh });
}
