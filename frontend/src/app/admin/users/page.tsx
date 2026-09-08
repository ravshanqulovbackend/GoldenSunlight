"use client";

import { useState } from "react";
import Link from "next/link";
import { useUsers, useUpdateUserRole, useDeleteUser } from "@/lib/query/hooks/useUsers";
import { useAuthStore } from "@/lib/stores/authStore";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getImageUrl } from "@/lib/utils/image";
import { ROLE_LABELS, type User, type UserRole } from "@/types/auth";

const PAGE_SIZE = 12;

const DEFAULT_ORDERING = "-created_at";

const SORT_OPTIONS = [
  { value: "first_name", label: "By name" },
  { value: DEFAULT_ORDERING, label: "Date joined" },
  { value: "role_group,role", label: "By role" },
];

function DeleteUserButton({ user }: { user: User }) {
  const [confirming, setConfirming] = useState(false);
  const deleteUser = useDeleteUser();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="danger" disabled={deleteUser.isPending} onClick={() => deleteUser.mutate(user.id)}>
          Yes, delete
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label="Delete"
      className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
    >
      <Icon name="delete" className="text-[18px]" />
    </button>
  );
}

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === "superadmin";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [ordering, setOrdering] = useState(DEFAULT_ORDERING);

  const { data, isLoading, isError, refetch } = useUsers({ page, search: search || undefined, ordering });
  const updateRole = useUpdateUserRole();

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-md text-on-surface">Users</h1>
        <p className="body-md text-on-surface-variant">{data ? `${data.count} users` : ""}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
          className="flex max-w-sm flex-1 gap-2"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, login, phone..."
            className="h-11 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 body-md focus:border-secondary focus:outline-none"
          />
          <Button type="submit" variant="outline">
            <Icon name="search" className="text-[18px]" />
          </Button>
        </form>

        <div className="flex gap-2">
          {SORT_OPTIONS.map((option) => {
            const active = ordering === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setOrdering(option.value);
                  setPage(1);
                }}
                className={`h-11 rounded-lg border px-4 label-md transition-colors ${
                  active
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.results.length === 0 && <EmptyState icon="group" title="No users found" />}

      {data && data.results.length > 0 && (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Login</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.results.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const canDelete = !isSelf && (isSuperAdmin || user.role === "staff");
                return (
                  <Tr key={user.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary text-on-primary label-md">
                          {user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getImageUrl(user.avatar)} alt={user.username} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center">
                              {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                            </span>
                          )}
                        </span>
                        <span>{[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}</span>
                      </div>
                    </Td>
                    <Td className="text-on-surface-variant">{user.username}</Td>
                    <Td className="text-on-surface-variant">{user.phone || "—"}</Td>
                    <Td>
                      {isSuperAdmin && !isSelf ? (
                        <Select
                          value={user.role}
                          onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value as UserRole })}
                          disabled={updateRole.isPending}
                          className="h-9 w-36"
                        >
                          <option value="staff">{ROLE_LABELS.staff}</option>
                          <option value="admin">{ROLE_LABELS.admin}</option>
                        </Select>
                      ) : (
                        <Badge tone={user.role === "staff" ? "neutral" : "primary"}>{ROLE_LABELS[user.role]}</Badge>
                      )}
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          aria-label="Go to profile"
                          className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                        >
                          <Icon name="person" className="text-[18px]" />
                        </Link>
                        {!isSelf && (
                          <Link
                            href={`/admin/support?customer=${user.id}`}
                            aria-label="Send message"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                          >
                            <Icon name="chat" className="text-[18px]" />
                          </Link>
                        )}
                        {canDelete && <DeleteUserButton user={user} />}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
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
    </div>
  );
}
