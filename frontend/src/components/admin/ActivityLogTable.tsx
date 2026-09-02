"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivityLog } from "@/lib/api/endpoints/activityLog";
import { formatDateTime } from "@/lib/utils/money";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { ActivityAction } from "@/types/activityLog";

const ACTION_TONE: Record<ActivityAction, "primary" | "secondary" | "error"> = {
  created: "primary",
  updated: "secondary",
  deleted: "error",
};

const MODEL_LABELS: Record<string, string> = {
  Product: "Product",
  Category: "Category",
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

function formatChanges(changes: Record<string, [string, string]>): string {
  const entries = Object.entries(changes);
  if (entries.length === 0) return "—";
  return entries
    .map(([field, [before, after]]) => `${formatFieldLabel(field)}: ${formatValue(before)} → ${formatValue(after)}`)
    .join("; ");
}

/** Only visible to superadmins (also restricted server-side via `IsSuperAdminRole`). */
export function ActivityLogTable() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["activity-log"],
    queryFn: () => getActivityLog(),
  });

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
              <Tr key={entry.id}>
                <Td>{entry.actor_display}</Td>
                <Td>
                  <Badge tone={ACTION_TONE[entry.action]}>{entry.action_display}</Badge>
                </Td>
                <Td>
                  {MODEL_LABELS[entry.model_name] ?? entry.model_name}: {entry.object_repr}
                </Td>
                <Td className="max-w-xs">
                  <span className="label-sm normal-case text-on-surface-variant">{formatChanges(entry.changes)}</span>
                </Td>
                <Td className="whitespace-nowrap">{formatDateTime(entry.created_at)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </section>
  );
}
