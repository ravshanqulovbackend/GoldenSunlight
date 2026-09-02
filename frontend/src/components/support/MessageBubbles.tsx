"use client";

import { useState } from "react";
import { AppImage } from "@/components/ui/AppImage";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/utils/image";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/money";
import type { SupportMessage } from "@/types/support";

const GROUP_WINDOW_MS = 2 * 60 * 1000;

interface MessageBubblesProps {
  messages: SupportMessage[];
  /** Messages from the sender with this ID are shown on the right (in the primary color). */
  currentUserId: number | undefined;
}

/**
 * Used both in the customer panel and the admin conversation window — the "which one is me"
 * distinction is made only via `currentUserId`. Consecutive messages from the same sender
 * (within 2 minutes) are grouped — the name/time is shown only at the start of the group.
 */
export function MessageBubbles({ messages, currentUserId }: MessageBubblesProps) {
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      {messages.map((msg, index) => {
        const isMine = msg.sender === currentUserId;
        const prev = messages[index - 1];
        const isGrouped =
          prev &&
          prev.sender === msg.sender &&
          new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < GROUP_WINDOW_MS;

        return (
          <div key={msg.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start", !isGrouped && "mt-3")}>
            {!isGrouped && (
              <span className="label-sm mb-1 px-1 text-on-surface-variant">
                {msg.sender_name || "?"} · {formatTime(msg.created_at)}
              </span>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2.5",
                isMine ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"
              )}
            >
              {msg.image && (
                <button
                  type="button"
                  onClick={() => setEnlargedImage(getImageUrl(msg.image))}
                  className="mb-2 block overflow-hidden rounded-md"
                >
                  <AppImage src={getImageUrl(msg.image)} alt="Attached image" className="max-h-48 w-full object-cover" />
                </button>
              )}
              {msg.message && <p className="body-md whitespace-pre-line">{msg.message}</p>}
            </div>
          </div>
        );
      })}

      {enlargedImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-inverse-surface/80 p-6"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-6 top-6 text-inverse-on-surface"
            onClick={() => setEnlargedImage(null)}
          >
            <Icon name="close" className="text-[28px]" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enlargedImage} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
