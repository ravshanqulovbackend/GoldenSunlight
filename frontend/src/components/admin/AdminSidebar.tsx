"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/lib/stores/authStore";
import { useNotifications } from "@/lib/query/hooks/useNotifications";
import { ROLE_LABELS } from "@/types/auth";
import { cn } from "@/lib/utils/cn";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

const NAV_ITEMS = [
  { href: "/admin/orders", label: "Orders", icon: "receipt_long" },
  { href: "/admin/products", label: "Products", icon: "inventory_2" },
  { href: "/admin/categories", label: "Categories", icon: "category" },
  { href: "/admin/reviews", label: "Reviews", icon: "rate_review" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/support", label: "Support", icon: "support_agent" },
  { href: "/admin/certificates", label: "Certificates", icon: "workspace_premium" },
  { href: "/admin/gallery", label: "Gallery", icon: "photo_library" },
  { href: "/admin/partnerships", label: "Partnership Requests", icon: "handshake" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

const DASHBOARD_NAV_ITEM = { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" };
const NOTIFICATIONS_NAV_ITEM = { href: "/admin/notifications", label: "Notifications", icon: "notifications" };

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "superadmin";
  const { data: notifications } = useNotifications();
  const unreadCount = isSuperAdmin ? (notifications?.results.filter((n) => !n.is_read).length ?? 0) : 0;
  const navItems = isSuperAdmin ? [DASHBOARD_NAV_ITEM, ...NAV_ITEMS, NOTIFICATIONS_NAV_ITEM] : NAV_ITEMS;

  return (
    <>
      <div className="mb-8 shrink-0 px-6">
        <h1 className="headline-md text-primary">Admin Panel</h1>
        <p className="label-sm text-on-surface-variant">GoldenSunlight</p>
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
          Back to Site
        </Link>
        <ProfileMenu placement="top" panelClassName="left-0 right-0 w-auto">
          <div className="mt-2 flex w-full items-center gap-3 rounded-xl bg-surface-container-high p-3 hover:bg-surface-container-highest">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary label-md">
              {(user?.first_name?.[0] || user?.username?.[0] || "A").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="label-md truncate text-on-surface">
                {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username}
              </p>
              <p className="label-sm uppercase text-on-surface-variant">{user ? ROLE_LABELS[user.role] : ""}</p>
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
  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low py-6 lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onMobileClose}
            className="absolute inset-0 bg-inverse-surface/50"
          />
          <div className="relative flex h-full w-72 max-w-[80%] flex-col border-r border-outline-variant bg-surface-container-low py-6 shadow-xl">
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container-high"
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
