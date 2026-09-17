import { http } from "../http";
import type { AppNotification } from "@/types/notification";

/** Sahifalanmagan — butun tarix (backend: `pagination_class = None`). */
export async function getNotifications(): Promise<AppNotification[]> {
  const { data } = await http.get<AppNotification[]>("/notifications/");
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
