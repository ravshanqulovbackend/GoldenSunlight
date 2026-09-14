"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { NavLink } from "./NavLink";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { LanguageToggle } from "./LanguageToggle";
import { useAuthStore, logoutAndRedirect } from "@/lib/stores/authStore";
import { useCart } from "@/lib/query/hooks/useCart";
import { useConversationsUnreadCount, useMyUnreadCount } from "@/lib/query/hooks/useSupport";
import { SupportChatPanel } from "@/components/support/SupportChatPanel";

function HeaderBadge({ count }: { count: number | undefined }) {
  if (!count) return null;
  return (
    <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 animate-pop-in items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-on-error">
      {count}
    </span>
  );
}

export function Header() {
  const t = useTranslations("Common");
  const tHeader = useTranslations("Header");
  const pathname = usePathname();
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

  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/about", label: t("aboutUs") },
  ];
  const showOrdersLink = isAuthenticated && !isAdmin;
  // Desktopda "My Orders" o'ng tarafdagi hisob amallari yonida turadi, lekin mobil
  // menyuda oddiy navigatsiya havolasi sifatida qoladi.
  const drawerLinks = showOrdersLink ? [...NAV_LINKS, { href: "/orders", label: t("myOrders") }] : NAV_LINKS;

  return (
    <>
      <header className="sticky top-0 z-40 h-16 animate-fade-down border-b border-outline-variant bg-surface/80 backdrop-blur-md transition-shadow duration-300 sm:h-20">
        <div className="mx-auto flex h-full max-w-container-max-width items-center justify-between gap-2 px-margin-mobile md:px-margin-desktop">
          <Link
            href="/"
            onClick={() => {
              if (pathname === "/") window.scrollTo({ top: 0 });
            }}
            className="gs-press title-lg min-w-0 shrink truncate uppercase tracking-wide text-primary hover:brightness-125 lg:headline-md"
          >
            GoldenSunlight
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            {isAuthenticated && !isAdmin && (
              <button
                type="button"
                onClick={() => setSupportPanelOpen(true)}
                aria-label={tHeader("reportIssue")}
                className="gs-icon-btn relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary md:flex"
              >
                <Icon name="support_agent" />
                <HeaderBadge count={myUnreadCount} />
              </button>
            )}
            {isAdmin && (
              <Link
                href="/admin/support"
                aria-label={tHeader("inquiries")}
                className="gs-icon-btn relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary md:flex"
              >
                <Icon name="notifications" />
                <HeaderBadge count={conversationsUnreadCount} />
              </Link>
            )}
            <Link
              href="/products"
              aria-label={tHeader("search")}
              className="gs-icon-btn hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary md:flex"
            >
              <Icon name="search" />
            </Link>
            <Link
              href="/wishlist"
              aria-label={tHeader("wishlist")}
              className="gs-icon-btn hidden h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary md:flex"
            >
              <Icon name="favorite" />
            </Link>
            <Link
              href="/cart"
              aria-label={tHeader("cart")}
              className="gs-icon-btn relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary sm:h-10 sm:w-10"
            >
              <Icon name="shopping_bag" />
              {isAuthenticated && !!cart?.total_items && (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 animate-pop-in items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-on-error">
                  {cart.total_items}
                </span>
              )}
            </Link>
            {showOrdersLink && (
              <NavLink href="/orders" className="hidden md:inline-flex">
                {t("myOrders")}
              </NavLink>
            )}
            <LanguageToggle className="hidden md:flex" />
            {isAuthenticated ? (
              <>
                {/* Admin paneliga o'tish profil sahifasidagi amallar ro'yxatida. */}
                <NavLink href="/profile" className="hidden md:inline-flex">
                  {tHeader("profile")}
                </NavLink>
                <button
                  type="button"
                  onClick={() => logoutAndRedirect()}
                  aria-label={t("logOut")}
                  title={t("logOut")}
                  className="gs-icon-btn hidden h-10 w-10 items-center justify-center rounded-full hover:bg-error-container hover:text-on-error-container md:flex"
                >
                  <Icon name="logout" mirrorInRtl />
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="gs-underline gs-press ms-2 hidden label-md text-primary md:block">
                {t("logIn")}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("menu")}
              className="gs-icon-btn flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary sm:h-10 sm:w-10 md:hidden"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={drawerLinks}
        isAuthenticated={isAuthenticated}
        user={user}
        onOpenSupport={isAdmin ? undefined : () => setSupportPanelOpen(true)}
        supportUnreadCount={myUnreadCount}
      />

      {isAuthenticated && !isAdmin && (
        <SupportChatPanel open={supportPanelOpen} onClose={() => setSupportPanelOpen(false)} />
      )}
    </>
  );
}
