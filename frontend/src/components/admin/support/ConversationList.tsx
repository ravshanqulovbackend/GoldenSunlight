"use client";

import { useConversations } from "@/lib/query/hooks/useSupport";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/money";
import { getImageUrl } from "@/lib/utils/image";

interface ConversationListProps {
  selectedCustomerId: number | null;
  onSelect: (customerId: number) => void;
}

export function ConversationList({ selectedCustomerId, onSelect }: ConversationListProps) {
  const { data, isLoading, isError, refetch } = useConversations();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.results.length === 0) {
    return <EmptyState icon="support_agent" title="No conversations yet" />;
  }

  return (
    <ul className="flex flex-col divide-y divide-outline-variant">
      {data.results.map((conversation) => {
        const isSelected = selectedCustomerId === conversation.id;
        const isUnread = conversation.unread_count > 0;
        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "flex w-full items-stretch gap-3 border-l-[3px] border-transparent px-4 py-3 text-left transition-colors hover:bg-surface-container-low",
                isSelected && "border-primary bg-primary-container/30"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-container text-on-secondary-container label-md font-semibold uppercase">
                {conversation.avatar ? (
                  <img
                    src={getImageUrl(conversation.avatar)}
                    alt={conversation.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  conversation.full_name?.charAt(0) || "?"
                )}
              </div>
              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className={cn("label-md text-on-surface", isUnread ? "font-bold" : "font-semibold")}>
                    {conversation.full_name}
                  </span>
                  <p
                    className={cn(
                      "label-sm truncate normal-case",
                      isUnread ? "font-semibold text-on-surface" : "text-on-surface-variant"
                    )}
                  >
                    {conversation.last_message}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between gap-1 self-stretch">
                  {isUnread && <Badge tone="error">{conversation.unread_count}</Badge>}
                  <span className="label-sm mt-auto text-on-surface-variant">
                    {formatDate(conversation.last_message_at)}
                  </span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
