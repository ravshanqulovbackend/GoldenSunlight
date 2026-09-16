import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteConversation,
  getConversationThread,
  getConversations,
  getConversationsUnreadCount,
  getMyMessages,
  getMyUnreadCount,
  sendSupportMessage,
  suggestSupportReply,
} from "@/lib/api/endpoints/support";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";

const MY_MESSAGES_KEY = ["support", "mine"];
const MY_UNREAD_KEY = ["support", "mine", "unread-count"];
const CONVERSATIONS_KEY = ["support", "conversations"];
const CONVERSATIONS_UNREAD_KEY = ["support", "conversations", "unread-count"];
const conversationThreadKey = (customerId: number) => ["support", "conversations", customerId];

/** The customer's own conversation — only fetched while the panel is open (via `enabled`). */
export function useMyMessages(enabled: boolean) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);
  return useQuery({
    queryKey: MY_MESSAGES_KEY,
    queryFn: getMyMessages,
    enabled: enabled && isHydrated && !!access,
    refetchInterval: enabled ? 20_000 : false,
  });
}

/** For the customer badge in the header — global, slower interval (60s). */
export function useMyUnreadCount() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  return useQuery({
    queryKey: MY_UNREAD_KEY,
    queryFn: getMyUnreadCount,
    enabled: isHydrated && !!access && !isAdmin,
    refetchInterval: 60_000,
  });
}

export function useSendSupportMessage(customerId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { message?: string; image?: File }) =>
      sendSupportMessage(customerId !== undefined ? { ...payload, customer: customerId } : payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_MESSAGES_KEY });
      queryClient.invalidateQueries({ queryKey: MY_UNREAD_KEY });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_UNREAD_KEY });
      if (customerId !== undefined) {
        queryClient.invalidateQueries({ queryKey: conversationThreadKey(customerId) });
      }
    },
    onError: (error) => toast(parseApiError(error).message || "Failed to send message", "error"),
  });
}

/** List of conversations for admin/superadmin. */
export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: () => getConversations(),
  });
}

/** For the bell icon badge in the header — global, 60s interval. */
export function useConversationsUnreadCount() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  return useQuery({
    queryKey: CONVERSATIONS_UNREAD_KEY,
    queryFn: getConversationsUnreadCount,
    enabled: isHydrated && !!access && isAdmin,
    refetchInterval: 60_000,
  });
}

export function useConversationThread(customerId: number | null) {
  return useQuery({
    queryKey: customerId ? conversationThreadKey(customerId) : ["support", "conversations", "none"],
    queryFn: () => getConversationThread(customerId as number),
    enabled: customerId !== null,
    refetchInterval: customerId !== null ? 15_000 : false,
  });
}

/** Drafts an AI-suggested reply for the admin to review — never sends anything
 * itself. Caller drops the returned text into the composer for editing. */
export function useSuggestReply(customerId: number | null) {
  return useMutation({
    mutationFn: () => suggestSupportReply(customerId as number),
    onError: (error) => toast(parseApiError(error).message || "Failed to generate a suggestion", "error"),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: number) => deleteConversation(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_UNREAD_KEY });
      toast("Conversation deleted", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "Error deleting", "error"),
  });
}
