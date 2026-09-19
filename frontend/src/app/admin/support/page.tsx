"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/lib/api/endpoints/support";
import { useUser } from "@/lib/query/hooks/useUsers";
import { ConversationList } from "@/components/admin/support/ConversationList";
import { ConversationThread } from "@/components/admin/support/ConversationThread";
import { cn } from "@/lib/utils/cn";
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
          avatar: fallbackUser.avatar ?? null,
          last_message: "",
          unread_count: 0,
          last_message_at: "",
        }
      : null);

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] flex-col gap-4 sm:h-[calc(100dvh-7.5rem)] lg:h-[calc(100dvh-4rem)]">
      <Suspense fallback={null}>
        <InitialCustomerId onResolved={setSelectedCustomerId} />
      </Suspense>

      <div>
        <h1 className="headline-md text-on-surface">Support</h1>
        <p className="body-md text-on-surface-variant">Conversations with customers.</p>
      </div>

      {/*
       * `grid` edi — CSS Grid'da bitta "auto" qatorning balandligi konteynerga
       * cho'zilsa ham, bu cho'zilgan balandlik ba'zan bolalar ichidagi foizli
       * (`h-full`) balandlik hisoblanishi uchun "aniq" balandlik deb qabul
       * qilinmasligi mumkin — natijada `ConversationThread` ichidagi xabar
       * ro'yxati cheksiz o'sib, "Write a reply" maydonini konteynerdan
       * (`overflow-hidden`) tashqariga chiqarib, ko'rinmas qilib qo'yardi.
       * `flex` + `min-h-0` esa balandlikni har doim uzatadi — hech qanday
       * noaniqlik qolmaydi.
       */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-outline-variant md:flex-row">
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto custom-scrollbar border-outline-variant bg-surface-container-lowest md:block md:w-[320px] md:flex-none md:border-r",
            selectedCustomerId !== null ? "hidden md:block" : "block"
          )}
        >
          <ConversationList selectedCustomerId={selectedCustomerId} onSelect={setSelectedCustomerId} />
        </div>
        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 bg-surface-container-lowest md:block",
            selectedCustomerId === null ? "hidden md:block" : "block"
          )}
        >
          <ConversationThread
            customerId={selectedCustomerId}
            conversation={selectedConversation}
            onDeleted={() => setSelectedCustomerId(null)}
            onBack={() => setSelectedCustomerId(null)}
          />
        </div>
      </div>
    </div>
  );
}
