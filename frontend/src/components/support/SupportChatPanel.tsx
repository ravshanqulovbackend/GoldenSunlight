"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMyMessages, useSendSupportMessage } from "@/lib/query/hooks/useSupport";
import { MessageBubbles } from "./MessageBubbles";
import { MessageComposer } from "./MessageComposer";

interface SupportChatPanelProps {
  open: boolean;
  onClose: () => void;
}

/** Not present in the frontend_html_reference mockups — built from scratch, same overlay+slide pattern as MobileNavDrawer. */
export function SupportChatPanel({ open, onClose }: SupportChatPanelProps) {
  const user = useAuthStore((s) => s.user);
  const { data: messages, isLoading } = useMyMessages(open);
  const sendMessage = useSendSupportMessage();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-inverse-surface/50" />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-outline-variant p-4">
          <div>
            <h2 className="title-lg text-on-surface">Need help?</h2>
            <p className="label-sm text-on-surface-variant">Describe the problem or error, and attach an image.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {messages && messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Icon name="support_agent" className="text-[40px] text-outline" />
              <p className="body-md text-on-surface-variant">
                Found a problem or error on the site? Leave a message below — an admin will review it.
              </p>
            </div>
          )}
          {messages && messages.length > 0 && <MessageBubbles messages={messages} currentUserId={user?.id} />}
        </div>

        <MessageComposer onSend={(payload) => sendMessage.mutate(payload)} isSending={sendMessage.isPending} />
      </div>
    </div>
  );
}
