import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { Conversation, SupportMessage } from "@/types/support";

interface SendMessagePayload {
  message?: string;
  image?: File;
  /** Faqat admin/superadmin javob yozayotganda — kimning suhbatiga yozilayotgani. */
  customer?: number;
}

function buildMessageFormData(payload: SendMessagePayload): FormData {
  const formData = new FormData();
  if (payload.message) formData.append("message", payload.message);
  if (payload.customer !== undefined) formData.append("customer", String(payload.customer));
  if (payload.image) formData.append("image", payload.image);
  return formData;
}

export async function sendSupportMessage(payload: SendMessagePayload): Promise<SupportMessage> {
  const { data } = await http.post<SupportMessage>("/support/messages/", buildMessageFormData(payload));
  return data;
}

/** Mijozning o'z suhbati — sahifalanmagan, butun tarix. */
export async function getMyMessages(): Promise<SupportMessage[]> {
  const { data } = await http.get<SupportMessage[]>("/support/messages/mine/");
  return data;
}

export async function getMyUnreadCount(): Promise<number> {
  const { data } = await http.get<{ unread_count: number }>("/support/messages/mine/unread-count/");
  return data.unread_count;
}

export async function getConversations(page = 1): Promise<Paginated<Conversation>> {
  const { data } = await http.get<Paginated<Conversation>>("/support/conversations/", { params: { page } });
  return data;
}

export async function getConversationsUnreadCount(): Promise<number> {
  const { data } = await http.get<{ unread_count: number }>("/support/conversations/unread-count/");
  return data.unread_count;
}

/** Sahifalanmagan — bitta mijozning butun suhbat tarixi. */
export async function getConversationThread(customerId: number): Promise<SupportMessage[]> {
  const { data } = await http.get<SupportMessage[]>(`/support/conversations/${customerId}/`);
  return data;
}

/** Faqat superadmin — butun suhbatni o'chiradi. */
export async function deleteConversation(customerId: number): Promise<void> {
  await http.delete(`/support/conversations/${customerId}/`);
}

/** AI'dan javob loyihasini so'raydi — hech qachon o'zi yubormaydi, admin ko'rib
 * chiqib composer'ga tushirib, tahrirlab yuboradi (yoki tashlaydi). */
export async function suggestSupportReply(customerId: number): Promise<string> {
  const { data } = await http.post<{ draft: string }>(`/support/conversations/${customerId}/suggest-reply/`);
  return data.draft;
}
