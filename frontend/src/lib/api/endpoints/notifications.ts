import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { AppNotification } from "@/types/notification";

export async function getNotifications(): Promise<Paginated<AppNotification>> {
  const { data } = await http.get<Paginated<AppNotification>>("/notifications/");
  return data;
}

export async function markNotificationRead(id: number): Promise<{ detail: string }> {
  const { data } = await http.post<{ detail: string }>(`/notifications/read/${id}/`);
  return data;
}

export async function markAllNotificationsRead(): Promise<{ detail: string }> {
  const { data } = await http.post<{ detail: string }>("/notifications/read-all/");
  return data;
}
