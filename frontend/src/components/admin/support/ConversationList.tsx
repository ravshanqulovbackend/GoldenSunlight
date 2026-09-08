"use client";

import { useConversations } from "@/lib/query/hooks/useSupport";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/money";

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
      {data.results.map((conversation) => (
        <li key={conversation.id}>
          <button
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "flex w-full items-stretch justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-container-low",
              selectedCustomerId === conversation.id && "bg-primary-container/30"
            )}
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="label-md font-semibold text-on-surface">{conversation.full_name}</span>
              <p className="label-sm truncate normal-case text-on-surface-variant">{conversation.last_message}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end justify-between gap-1">
              {conversation.unread_count > 0 && <Badge tone="error">{conversation.unread_count}</Badge>}
              <span className="label-sm ml-auto text-on-surface-variant">{formatDate(conversation.last_message_at)}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
