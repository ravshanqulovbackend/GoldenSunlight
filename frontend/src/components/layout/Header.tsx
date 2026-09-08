"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { NavLink } from "./NavLink";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { ProfileMenu } from "./ProfileMenu";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCart } from "@/lib/query/hooks/useCart";
import { useConversationsUnreadCount, useMyUnreadCount } from "@/lib/query/hooks/useSupport";
import { useNotifications } from "@/lib/query/hooks/useNotifications";
import { SupportChatPanel } from "@/components/support/SupportChatPanel";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
];

function HeaderBadge({ count }: { count: number | undefined }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-on-error">
      {count}
    </span>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportPanelOpen, setSupportPanelOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const access = useAuthStore((s) => s.access);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isAuthenticated = isHydrated && !!access;
  const { data: cart } = useCart();
  const { data: myUnreadCount } = useMyUnreadCount();
  const { data: conversationsUnreadCount } = useConversationsUnreadCount();
  const { data: notifications } = useNotifications();
  const unreadNotifications = isAdmin ? 0 : notifications?.results.filter((n) => !n.is_read).length ?? 0;

  return (
    <>
      <header className="sticky top-0 z-40 h-20 border-b border-outline-variant bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-container-max-width items-center justify-between px-margin-mobile md:px-margin-desktop">
          <Link href="/" className="headline-md uppercase tracking-wide text-primary">
            GoldenSunlight
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {isAuthenticated && !isAdmin && (
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low md:flex"
              >
                <Icon name="notifications" />
                <HeaderBadge count={unreadNotifications} />
              </Link>
            )}
            {isAuthenticated && !isAdmin && (
              <button
                type="button"
                onClick={() => setSupportPanelOpen(true)}
                aria-label="Report an issue"
                className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low md:flex"
              >
                <Icon name="support_agent" />
                <HeaderBadge count={myUnreadCount} />
              </button>
            )}
            {isAdmin && (
              <Link
                href="/admin/support"
                aria-label="Inquiries"
                className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low md:flex"
              >
                <Icon name="notifications" />
                <HeaderBadge count={conversationsUnreadCount} />
              </Link>
            )}
            <Link
              href="/products"
              aria-label="Search"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low md:flex"
            >
              <Icon name="search" />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low md:flex"
            >
              <Icon name="favorite" />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low"
            >
              <Icon name="shopping_cart" />
              {isAuthenticated && !!cart?.total_items && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-on-error">
                  {cart.total_items}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <ProfileMenu placement="bottom">
                <span
                  aria-label="Profile"
                  className="ml-1 flex h-10 items-center gap-2 rounded-full border border-outline-variant px-3 hover:bg-surface-container-low"
                >
                  <Icon name="person" className="text-[20px]" />
                  <span className="label-md max-w-[120px] truncate text-on-surface">
                    {user?.first_name || user?.username}
                  </span>
                </span>
              </ProfileMenu>
            ) : (
              <Link href="/auth/login" className="ml-2 hidden label-md text-primary hover:underline md:block">
                Log In
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low md:hidden"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={NAV_LINKS}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      {isAuthenticated && !isAdmin && (
        <SupportChatPanel open={supportPanelOpen} onClose={() => setSupportPanelOpen(false)} />
      )}
    </>
  );
}
