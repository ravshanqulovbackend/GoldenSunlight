"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuthStore, logoutAndRedirect } from "@/lib/stores/authStore";
import { getImageUrl } from "@/lib/utils/image";
import { formatDate } from "@/lib/utils/money";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useRoleLabels } from "@/lib/utils/roles";
import { cn } from "@/lib/utils/cn";

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-4">
      <Icon name={icon} className="mt-0.5 text-[20px] text-on-surface-variant" />
      <div className="min-w-0">
        <p className="label-sm text-on-surface-variant">{label}</p>
        <p className="body-lg break-words text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  href,
  onClick,
  danger,
}: {
  icon: string;
  title: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const content = (
    <>
      <Icon name={icon} className={cn("text-[24px]", danger ? "text-error" : "text-primary")} />
      <span className={cn("min-w-0 title-md", danger ? "text-error" : "text-on-surface")}>{title}</span>
    </>
  );
  const className =
    "flex w-full items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-start transition-colors hover:bg-surface-container-low";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const tMenu = useTranslations("ProfileMenu");
  const roleLabels = useRoleLabels();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const isAdminRole = user.role === "admin" || user.role === "superadmin";

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <h1 className="headline-md text-on-surface">{t("title")}</h1>
      <p className="mt-2 body-md text-on-surface-variant">{t("subtitle")}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-5">
            <span className="flex h-20 w-20 shrink-0 overflow-hidden rounded-full bg-secondary-container text-on-secondary-container">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getImageUrl(user.avatar)} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center headline-sm">
                  {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                </span>
              )}
            </span>
            <h2 className="title-lg break-words text-on-surface sm:headline-sm">{fullName}</h2>
          </div>

          <div className="mt-6 divide-y divide-outline-variant border-t border-outline-variant">
            <DetailRow icon="person" label={t("fullName")} value={fullName} />
            <DetailRow icon="badge" label={t("username")} value={user.username} />
            <DetailRow icon="mail" label={t("email")} value={user.email || t("notProvided")} />
            <DetailRow icon="call" label={t("phoneNumber")} value={user.phone || t("notProvided")} />
            <DetailRow icon="calendar_today" label={t("memberSince")} value={formatDate(user.created_at)} />
            <DetailRow icon="verified_user" label={t("role")} value={roleLabels[user.role]} />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {isAdminRole && (
            <ActionCard
              icon="dashboard"
              title={tMenu("adminPanel")}
              href={user.role === "superadmin" ? "/admin/dashboard" : "/admin/orders"}
            />
          )}
          <ActionCard icon="edit" title={tMenu("editInformation")} href="/profile/edit" />
          <ActionCard icon="lock_reset" title={tMenu("changePassword")} href="/profile/password" />
          {user.role === "staff" && (
            <ActionCard icon="package_2" title={tCommon("myOrders")} href="/orders" />
          )}
          <ActionCard icon="logout" title={tCommon("logOut")} onClick={() => logoutAndRedirect()} danger />
        </div>
      </div>
    </div>
  );
}
