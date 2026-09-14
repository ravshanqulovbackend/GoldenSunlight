"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { getAllAdminPartnerships } from "@/lib/api/endpoints/partnerships";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/utils/money";
import { PARTNERSHIP_STATUS_LABELS, type PartnershipStatus } from "@/types/partnership";

const STATUS_TONE: Record<PartnershipStatus, "primary" | "secondary" | "error" | "neutral"> = {
  pending: "secondary",
  reviewed: "neutral",
  approved: "primary",
  rejected: "error",
};

/** Roughly what fits in the two clamped lines — anything longer gets a toggle. */
const CLAMPED_MESSAGE_CHARS = 90;

/** A long inquiry would otherwise stretch its row to the height of the screen, so the
 * message is clamped to two lines and only opens up when the admin asks for it. */
function MessageCell({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!message) return <span className="text-on-surface-variant">—</span>;

  return (
    <div className="w-72 max-w-72 space-y-1">
      <p
        title={expanded ? undefined : message}
        className={cn(
          "text-on-surface-variant",
          expanded ? "whitespace-pre-wrap break-words" : "line-clamp-2-custom",
        )}
      >
        {message}
      </p>
      {message.length > CLAMPED_MESSAGE_CHARS && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="label-sm normal-case text-primary hover:underline"
        >
          {expanded ? "Show less" : "Show full"}
        </button>
      )}
    </div>
  );
}

export default function AdminPartnershipsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-partnerships"],
    queryFn: () => getAllAdminPartnerships(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-md text-on-surface">Partnership Requests</h1>
        <p className="body-md text-on-surface-variant">
          Inquiries submitted through the partnership form on the &quot;About Us&quot; page.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState icon="handshake" title="No partnership requests" description="No one has submitted an inquiry yet." />
      )}

      {data && data.length > 0 && (
        <Table>
          <Thead>
            <Tr>
              <Th>Full Name</Th>
              <Th>Company</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
              <Th>Message</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((request) => (
              <Tr key={request.id} className="align-top">
                <Td>{request.full_name}</Td>
                <Td className="text-on-surface-variant">{request.company_name || "—"}</Td>
                <Td className="whitespace-nowrap">{request.phone}</Td>
                <Td className="text-on-surface-variant">{request.email || "—"}</Td>
                <Td>
                  <MessageCell message={request.message} />
                </Td>
                <Td>
                  <Badge tone={STATUS_TONE[request.status]}>{PARTNERSHIP_STATUS_LABELS[request.status]}</Badge>
                </Td>
                <Td className="whitespace-nowrap text-on-surface-variant">{formatDate(request.created_at)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
