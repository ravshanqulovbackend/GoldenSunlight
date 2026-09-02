"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useConversationThread, useDeleteConversation, useSendSupportMessage } from "@/lib/query/hooks/useSupport";
import { MessageBubbles } from "@/components/support/MessageBubbles";
import { MessageComposer } from "@/components/support/MessageComposer";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Conversation } from "@/types/support";

interface ConversationThreadProps {
  customerId: number | null;
  conversation: Conversation | null;
  onDeleted: () => void;
}

export function ConversationThread({ customerId, conversation, onDeleted }: ConversationThreadProps) {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "superadmin";
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data: messages, isLoading, isError, refetch } = useConversationThread(customerId);
  const sendMessage = useSendSupportMessage(customerId ?? undefined);
  const deleteConversation = useDeleteConversation();

  if (customerId === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState icon="chat" title="Select a conversation" description="Select a customer from the list on the left." />
      </div>
    );
  }

  function handleDelete() {
    if (!customerId) return;
    deleteConversation.mutate(customerId, { onSuccess: onDeleted });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-outline-variant p-4">
        <h2 className="title-lg text-on-surface">{conversation?.full_name ?? "Conversation"}</h2>
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            {confirmingDelete ? (
              <>
                <span className="label-sm text-on-surface-variant">Are you sure you want to delete this?</span>
                <Button size="sm" variant="danger" disabled={deleteConversation.isPending} onClick={handleDelete}>
                  Yes, delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Delete conversation"
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
              >
                <Icon name="delete" className="text-[18px]" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {messages && <MessageBubbles messages={messages} currentUserId={user?.id} />}
      </div>

      <MessageComposer onSend={(payload) => sendMessage.mutate(payload)} isSending={sendMessage.isPending} placeholder="Write a reply..." />
    </div>
  );
}
