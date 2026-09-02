export interface SupportMessage {
  id: number;
  customer: number;
  sender: number | null;
  sender_name: string;
  sender_role: string;
  message: string;
  image: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  username: string;
  full_name: string;
  last_message: string;
  unread_count: number;
  last_message_at: string;
}
