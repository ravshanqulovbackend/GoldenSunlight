"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/lib/stores/authStore";
import { useNotifications } from "@/lib/query/hooks/useNotifications";
import { useRoleLabels } from "@/lib/utils/roles";
import { cn } from "@/lib/utils/cn";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
// import { LanguageToggle } from "@/components/layout/LanguageToggle"; // temporarily hidden — re-enable on request

function useNavItems(t: (key: string) => string) {
  const NAV_ITEMS = [
    { href: "/admin/orders", label: t("orders"), icon: "receipt_long" },
    { href: "/admin/products", label: t("products"), icon: "inventory_2" },
    { href: "/admin/categories", label: t("categories"), icon: "category" },
    { href: "/admin/reviews", label: t("reviews"), icon: "rate_review" },
    { href: "/admin/users", label: t("users"), icon: "group" },
    { href: "/admin/support", label: t("support"), icon: "support_agent" },
    { href: "/admin/certificates", label: t("certificates"), icon: "workspace_premium" },
    { href: "/admin/gallery", label: t("gallery"), icon: "photo_library" },
    { href: "/admin/partnerships", label: t("partnerships"), icon: "handshake" },
    { href: "/admin/settings", label: t("settings"), icon: "settings" },
  ];
  const DASHBOARD_NAV_ITEM = { href: "/admin/dashboard", label: t("dashboard"), icon: "dashboard" };
  const NOTIFICATIONS_NAV_ITEM = { href: "/admin/notifications", label: t("notifications"), icon: "notifications" };
  return { NAV_ITEMS, DASHBOARD_NAV_ITEM, NOTIFICATIONS_NAV_ITEM };
}

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("AdminNav");
  const roleLabels = useRoleLabels();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "superadmin";
  const { data: notifications } = useNotifications();
  const unreadCount = isSuperAdmin ? (notifications?.results.filter((n) => !n.is_read).length ?? 0) : 0;
  const { NAV_ITEMS, DASHBOARD_NAV_ITEM, NOTIFICATIONS_NAV_ITEM } = useNavItems(t);
  const navItems = isSuperAdmin ? [DASHBOARD_NAV_ITEM, ...NAV_ITEMS, NOTIFICATIONS_NAV_ITEM] : NAV_ITEMS;

  return (
    <>
      <div className="mb-8 flex shrink-0 items-center justify-between gap-3 px-6">
        <div>
          <h1 className="headline-md text-primary">{t("adminPanel")}</h1>
          <p className="label-sm text-on-surface-variant">GoldenSunlight</p>
        </div>
        {/* <LanguageToggle /> temporarily hidden — re-enable on request */}
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 label-md transition-colors",
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              <Icon name={item.icon} className="text-[20px]" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/notifications" && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 label-sm text-on-error">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-outline-variant px-3 pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-4 py-3 label-md text-on-surface-variant hover:bg-surface-container-high"
        >
          <Icon name="storefront" className="text-[20px]" />
          {t("backToSite")}
        </Link>
        <ProfileMenu placement="top" panelClassName="start-0 end-0 w-auto">
          <div className="mt-2 flex w-full items-center gap-3 rounded-xl bg-surface-container-high p-3 hover:bg-surface-container-highest">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary label-md">
              {(user?.first_name?.[0] || user?.username?.[0] || "A").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 text-start">
              <p className="label-md truncate text-on-surface">
                {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username}
              </p>
              <p className="label-sm uppercase text-on-surface-variant">{user ? roleLabels[user.role] : ""}</p>
            </div>
            <Icon name="unfold_more" className="text-[18px] text-on-surface-variant" />
          </div>
        </ProfileMenu>
      </div>
    </>
  );
}

/**
 * Below `lg` (< 1024px) the fixed 256px sidebar has no room next to real content, so it's
 * swapped for an overlay drawer (same pattern as the storefront's MobileNavDrawer) driven by
 * `AdminLayout`'s hamburger button. At `lg` and above the original always-visible fixed
 * sidebar is used.
 */
export function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const t = useTranslations("AdminNav");
  return (
    <>
      <aside className="fixed start-0 top-0 z-30 hidden h-screen w-64 flex-col border-e border-outline-variant bg-surface-container-low py-6 lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("closeMenu")}
            onClick={onMobileClose}
            className="absolute inset-0 bg-inverse-surface/50"
          />
          <div className="relative flex h-full w-72 max-w-[80%] flex-col border-e border-outline-variant bg-surface-container-low py-6 shadow-xl">
            <button
              type="button"
              onClick={onMobileClose}
              aria-label={t("close")}
              className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container-high"
            >
              <Icon name="close" />
            </button>
            <SidebarContent onNavigate={onMobileClose} />
          </div>
        </div>
      )}
    </>
  );
}
