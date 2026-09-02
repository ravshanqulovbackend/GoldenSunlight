"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/lib/api/endpoints/support";
import { useUser } from "@/lib/query/hooks/useUsers";
import { ConversationList } from "@/components/admin/support/ConversationList";
import { ConversationThread } from "@/components/admin/support/ConversationThread";
import type { Conversation } from "@/types/support";

/** Provides the initially selected conversation when arriving via `?customer=<id>`
 * (e.g. the "Send Message" button in the "Users" list). `useSearchParams` requires
 * a Suspense boundary in a client component (in production builds), so it's
 * extracted into a separate component. */
function InitialCustomerId({ onResolved }: { onResolved: (id: number) => void }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("customer");
  const id = raw ? Number(raw) : null;

  useEffect(() => {
    if (id && Number.isFinite(id)) onResolved(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}

export default function AdminSupportPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { data } = useQuery({ queryKey: ["support", "conversations"], queryFn: () => getConversations() });
  const conversationFromList = data?.results.find((c) => c.id === selectedCustomerId) ?? null;

  // If a conversation with this customer hasn't started yet (not in the list), we
  // separately fetch their name for the header — otherwise it would show a generic "Conversation".
  const { data: fallbackUser } = useUser(!conversationFromList && selectedCustomerId ? selectedCustomerId : 0);
  const selectedConversation: Conversation | null =
    conversationFromList ??
    (fallbackUser
      ? {
          id: fallbackUser.id,
          username: fallbackUser.username,
          full_name: [fallbackUser.first_name, fallbackUser.last_name].filter(Boolean).join(" ") || fallbackUser.username,
          last_message: "",
          unread_count: 0,
          last_message_at: "",
        }
      : null);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4">
      <Suspense fallback={null}>
        <InitialCustomerId onResolved={setSelectedCustomerId} />
      </Suspense>

      <div>
        <h1 className="headline-md text-on-surface">Support</h1>
        <p className="body-md text-on-surface-variant">Conversations with customers.</p>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden rounded-lg border border-outline-variant md:grid-cols-[320px_1fr]">
        <div className="overflow-y-auto custom-scrollbar border-r border-outline-variant bg-surface-container-lowest">
          <ConversationList selectedCustomerId={selectedCustomerId} onSelect={setSelectedCustomerId} />
        </div>
        <div className="bg-surface-container-lowest">
          <ConversationThread
            customerId={selectedCustomerId}
            conversation={selectedConversation}
            onDeleted={() => setSelectedCustomerId(null)}
          />
        </div>
      </div>
    </div>
  );
}
