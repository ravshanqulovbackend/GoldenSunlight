"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { getActivityLog } from "@/lib/api/endpoints/activityLog";
import { formatDateTime } from "@/lib/utils/money";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { ActivityAction } from "@/types/activityLog";

const PAGE_SIZE = 12;

/** How many changed fields a row shows before it collapses the rest behind a toggle. */
const COLLAPSED_CHANGES = 2;
/** Rough width (in characters) of one collapsed line — longer values get a toggle too. */
const COLLAPSED_LINE_CHARS = 56;

const ACTION_TONE: Record<ActivityAction, "primary" | "secondary" | "error"> = {
  created: "primary",
  updated: "secondary",
  deleted: "error",
};

const MODEL_LABELS: Record<string, string> = {
  Product: "Product",
  Category: "Category",
  Order: "Order",
  User: "User",
  Review: "Review",
  News: "News article",
  GalleryImage: "Gallery image",
  GalleryCategory: "Gallery category",
  Certificate: "Certificate",
  Company: "Company info",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  slug: "Slug",
  description: "Description",
  price: "Price",
  old_price: "Old Price",
  category: "Category",
  brand: "Brand",
  ingredients: "Ingredients",
  badge: "Badge",
  sku: "SKU",
  stock: "Stock",
  is_active: "Active",
  is_popular: "Popular",
  is_featured: "Featured",
  meta_title: "Meta Title",
  meta_description: "Meta Description",
  parent: "Parent Category",
  sort_order: "Sort Order",
  status: "Status",
  role: "Role",
  tracking_number: "Tracking Number",
  notes: "Notes",
  full_name: "Full Name",
  phone: "Phone",
  address_text: "Address",
  landmark: "Landmark",
  item_added: "Item Added",
  item_removed: "Item Removed",
  item_quantity: "Item Quantity",
  first_name: "First Name",
  last_name: "Last Name",
  email: "Email",
  rating: "Rating",
  comment: "Comment",
  title: "Title",
  summary: "Summary",
  content: "Content",
  is_published: "Published",
  issued_by: "Issued By",
  issued_date: "Issued Date",
  expiry_date: "Expiry Date",
  tagline: "Tagline",
  mission: "Mission",
  founded_year: "Founded Year",
  employee_count: "Employee Count",
  address: "Address",
  website: "Website",
};

/** "is_active" -> "Active" (known field), otherwise "some_field" -> "Some Field". */
function formatFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The backend stores raw `str()` of the Python value — "True"/"False"/"None" — since
 * it comes straight from `model_to_dict`. Render those as plain human-readable words
 * instead of leaking Python's repr to the admin UI. */
function formatValue(value: string): string {
  if (value === "True") return "Yes";
  if (value === "False") return "No";
  if (value === "None" || value === "") return "—";
  return value;
}

function formatChange(field: string, before: string, after: string): string {
  return `${formatFieldLabel(field)}: ${formatValue(before)} → ${formatValue(after)}`;
}

/** A single long value (an Arabic description, say) would otherwise stretch one row
 * to the height of a whole screen, so every change is kept to one truncated line and
 * only the first few are shown until the admin asks for the rest. */
function ChangesCell({ changes }: { changes: Record<string, [string, string]> }) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(changes);

  if (entries.length === 0) {
    return <span className="label-sm normal-case text-on-surface-variant">—</span>;
  }

  const lines = entries.map(([field, [before, after]]) => ({
    field,
    text: formatChange(field, before, after),
  }));
  const visible = expanded ? lines : lines.slice(0, COLLAPSED_CHANGES);
  const hiddenCount = lines.length - visible.length;
  const hasLongLine = lines.some((line) => line.text.length > COLLAPSED_LINE_CHARS);
  const showToggle = hiddenCount > 0 || hasLongLine;

  return (
    <div className="w-72 max-w-72 space-y-1">
      {visible.map((line) => (
        <p
          key={line.field}
          title={line.text}
          className={cn(
            "label-sm normal-case text-on-surface-variant",
            expanded ? "break-words" : "truncate",
          )}
        >
          {line.text}
        </p>
      ))}
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="label-sm normal-case text-primary hover:underline"
        >
          {expanded ? "Show less" : hiddenCount > 0 ? `+${hiddenCount} more` : "Show full"}
        </button>
      )}
    </div>
  );
}

/** Only visible to superadmins (also restricted server-side via `IsSuperAdminRole`). */
export function ActivityLogTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["activity-log", page],
    queryFn: () => getActivityLog(page),
    // New entries should show up on their own — nobody should have to hit refresh
    // to see an action that was just performed.
    staleTime: 0,
    refetchInterval: 5000,
  });
  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <h2 className="title-lg mb-4 text-on-surface">Recent Activity</h2>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.results.length === 0 && (
        <EmptyState icon="history" title="No activity yet" />
      )}

      {data && data.results.length > 0 && (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>Who</Th>
                <Th>Action</Th>
                <Th>What</Th>
                <Th>Changes</Th>
                <Th>When</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.results.map((entry) => (
                <Tr key={entry.id} className="align-top">
                  <Td className="whitespace-nowrap">{entry.actor_display}</Td>
                  <Td>
                    <Badge tone={ACTION_TONE[entry.action]}>{entry.action_display}</Badge>
                  </Td>
                  <Td>
                    <span
                      className="line-clamp-2-custom w-64 max-w-64"
                      title={`${MODEL_LABELS[entry.model_name] ?? entry.model_name}: ${entry.object_repr}`}
                    >
                      {MODEL_LABELS[entry.model_name] ?? entry.model_name}: {entry.object_repr}
                    </span>
                  </Td>
                  <Td>
                    <ChangesCell changes={entry.changes} />
                  </Td>
                  <Td className="whitespace-nowrap">{formatDateTime(entry.created_at)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="label-md text-on-surface-variant">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
