import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { User, UserRole } from "@/types/auth";

export interface AdminUserFilters {
  page?: number;
  search?: string;
  ordering?: string;
}

export async function getUsers(filters: AdminUserFilters = {}): Promise<Paginated<User>> {
  const { data } = await http.get<Paginated<User>>("/users/list/", { params: filters });
  return data;
}

export async function getUser(id: number): Promise<User> {
  const { data } = await http.get<User>(`/users/admin/${id}/`);
  return data;
}

export async function updateUserRole(id: number, role: UserRole): Promise<User> {
  const { data } = await http.patch<User>(`/users/admin/${id}/`, { role });
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await http.delete(`/users/admin/${id}/`);
}
