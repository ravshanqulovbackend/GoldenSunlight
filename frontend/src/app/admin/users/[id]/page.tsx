"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useUser, useUpdateUserRole, useDeleteUser } from "@/lib/query/hooks/useUsers";
import { useAuthStore } from "@/lib/stores/authStore";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { getImageUrl } from "@/lib/utils/image";
import { formatDate } from "@/lib/utils/money";
import { ROLE_LABELS, type UserRole } from "@/types/auth";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [confirming, setConfirming] = useState(false);

  const { data: user, isLoading, isError, refetch } = useUser(userId);
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const isSelf = userId === currentUser?.id;
  const isSuperAdmin = currentUser?.role === "superadmin";
  const canDelete = user && !isSelf && !(currentUser?.role === "admin" && user.role === "superadmin");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Users", href: "/admin/users" }, { label: user ? user.username : "..." }]} />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {user && (
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary text-on-primary title-lg">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getImageUrl(user.avatar)} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                  </span>
                )}
              </span>
              <div>
                <h1 className="headline-md text-on-surface">
                  {[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}
                </h1>
                <p className="label-sm text-on-surface-variant">Login: {user.username}</p>
              </div>
            </div>

            {isSuperAdmin && !isSelf ? (
              <Select
                value={user.role}
                onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value as UserRole })}
                disabled={updateRole.isPending}
                className="w-40"
              >
                <option value="staff">{ROLE_LABELS.staff}</option>
                <option value="admin">{ROLE_LABELS.admin}</option>
                <option value="superadmin">{ROLE_LABELS.superadmin}</option>
              </Select>
            ) : (
              <Badge tone={user.role === "staff" ? "neutral" : "primary"}>{ROLE_LABELS[user.role]}</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-outline-variant pt-4 sm:grid-cols-2">
            <div>
              <p className="label-sm text-on-surface-variant">Email</p>
              <p className="body-md text-on-surface">{user.email || "—"}</p>
            </div>
            <div>
              <p className="label-sm text-on-surface-variant">Phone</p>
              <p className="body-md text-on-surface">{user.phone || "—"}</p>
            </div>
            <div>
              <p className="label-sm text-on-surface-variant">Registration Date</p>
              <p className="body-md text-on-surface">{formatDate(user.created_at)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
            {!isSelf && (
              <Link href={`/admin/support?customer=${user.id}`}>
                <Button variant="outline">
                  <Icon name="chat" className="text-[18px]" />
                  Send Message
                </Button>
              </Link>
            )}

            {canDelete && (
              <>
                {confirming ? (
                  <div className="flex items-center gap-2">
                    <span className="label-sm text-on-surface-variant">Are you sure you want to delete this?</span>
                    <Button
                      variant="danger"
                      disabled={deleteUser.isPending}
                      onClick={() => deleteUser.mutate(user.id, { onSuccess: () => router.push("/admin/users") })}
                    >
                      Yes, delete
                    </Button>
                    <Button variant="outline" onClick={() => setConfirming(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant="danger" onClick={() => setConfirming(true)}>
                    <Icon name="delete" className="text-[18px]" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
