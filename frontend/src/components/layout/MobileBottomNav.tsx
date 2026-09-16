"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCart } from "@/lib/query/hooks/useCart";

interface TabItem {
  href: string;
  label: string;
  icon: string;
  filledIcon?: boolean;
  badge?: number;
}

function isTabActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/*
 * Ko'plab foydalanuvchi saytga aynan telefondan kiradi — shuning uchun eng
 * ko'p ishlatiladigan 5 ta manzil (bosh sahifa/katalog/savat/sevimlilar/profil)
 * ekran pastida doim qo'l ostida turadi (mobil ilovalarga xos "tab bar" naqshi).
 * `md:hidden` — tabletdan boshlab sarlavhadagi to'liq navigatsiya ko'rinadi,
 * shuning uchun bu panel endi keraksiz.
 */
export function MobileBottomNav() {
  const t = useTranslations("Common");
  const pathname = usePathname();
  const access = useAuthStore((s) => s.access);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = isHydrated && !!access;
  const { data: cart } = useCart();

  const tabs: TabItem[] = [
    { href: "/", label: t("home"), icon: "home" },
    { href: "/products", label: t("products"), icon: "category" },
    { href: "/cart", label: t("cart"), icon: "shopping_bag", badge: isAuthenticated ? cart?.total_items : undefined },
    { href: "/wishlist", label: t("wishlist"), icon: "favorite" },
    isAuthenticated
      ? { href: "/profile", label: t("profile"), icon: "person" }
      : { href: "/auth/login", label: t("logIn"), icon: "person" },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-outline-variant bg-surface/95 backdrop-blur-md md:hidden [padding-bottom:env(safe-area-inset-bottom)]"
      aria-label={t("menu")}
    >
      {tabs.map((tab) => {
        const active = isTabActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => {
              if (pathname === tab.href) window.scrollTo({ top: 0 });
            }}
            className={cn(
              "gs-press relative flex flex-1 flex-col items-center justify-center gap-0.5 text-on-surface-variant",
              active && "text-primary"
            )}
          >
            <span className="relative">
              <Icon name={tab.icon} filled={active} className="text-[22px]" />
              {!!tab.badge && (
                <span className="absolute -end-2 -top-1.5 flex h-4 min-w-4 animate-pop-in items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-on-error">
                  {tab.badge}
                </span>
              )}
            </span>
            <span className={cn("label-sm text-[11px] leading-none", active && "font-semibold")}>{tab.label}</span>
            {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}
