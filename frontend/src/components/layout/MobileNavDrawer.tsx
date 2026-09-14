"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { logoutAndRedirect } from "@/lib/stores/authStore";
import { LanguageToggle } from "./LanguageToggle";
import type { User } from "@/types/auth";

/** Drawer kirish/chiqish animatsiyasi davomiyligi (ms). */
const EXIT_MS = 320;

interface NavItem {
  href: string;
  label: string;
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  links: NavItem[];
  isAuthenticated: boolean;
  user: User | null;
  onOpenSupport?: () => void;
  supportUnreadCount?: number;
}

/** The mobile menu didn't exist at all in the frontend_html_reference mockups — built from scratch. */
export function MobileNavDrawer({
  open,
  onClose,
  links,
  isAuthenticated,
  user,
  onOpenSupport,
  supportUnreadCount,
}: MobileNavDrawerProps) {
  const t = useTranslations("MobileNav");
  /*
   * Chiqish animatsiyasi uchun `open` false bo'lishi bilan darhol unmount
   * qilinmaydi: panel avval yon tomonga sirg'alib chiqadi va animatsiya
   * tugaganda (`onAnimationEnd`) DOMdan olinadi.
   *
   * `open` -> mount o'tishi render bosqichida hal qilinadi (React'ning "prop
   * o'zgarganda state'ni moslash" naqshi) — buni `useEffect` ichida qilish
   * ortiqcha kaskadli renderga olib kelardi.
   */
  const [mounted, setMounted] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }
  const closing = mounted && !open;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label={t("menu")}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-inverse-surface/50 transition-opacity duration-300 ease-soft",
          closing ? "opacity-0" : "animate-fade-in"
        )}
      />
      <div
        style={{
          animation: `${closing ? "gs-drawer-out" : "gs-drawer-in"} ${EXIT_MS}ms var(--ease-soft) both`,
        }}
        onAnimationEnd={(event) => {
          // Ichkaridagi `.gs-stagger` havolalarining animatsiyalari ham shu
          // yergacha ko'tariladi — faqat panelning o'z animatsiyasi hisobga olinadi.
          if (event.target !== event.currentTarget) return;
          if (!open) setMounted(false);
        }}
        className="absolute end-0 top-0 flex h-full w-4/5 max-w-xs flex-col gap-6 bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="headline-md text-primary">{t("menu")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="gs-icon-btn flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high hover:rotate-90"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="gs-stagger flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="title-lg text-on-surface transition-[color,translate] duration-200 ease-soft hover:translate-x-1 hover:text-primary rtl:hover:-translate-x-1"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/wishlist"
            onClick={onClose}
            className="title-lg text-on-surface transition-[color,translate] duration-200 ease-soft hover:translate-x-1 hover:text-primary rtl:hover:-translate-x-1"
          >
            {t("wishlist")}
          </Link>
        </nav>

        <LanguageToggle className="w-fit" />

        <div className="mt-auto border-t border-outline-variant pt-6">
          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <p className="label-sm uppercase text-on-surface-variant">
                {user?.first_name || user?.username || t("profileFallback")}
              </p>
              {user?.role === "staff" && (
                <>
                  <Link href="/profile" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("myProfile")}
                  </Link>
                  <Link href="/profile/edit" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("editInformation")}
                  </Link>
                  <Link href="/profile/password" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("changePassword")}
                  </Link>
                  {onOpenSupport && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSupport();
                      }}
                      className="flex items-center gap-2 label-md text-on-surface-variant"
                    >
                      {t("reportIssue")}
                      {!!supportUnreadCount && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-on-error">
                          {supportUnreadCount}
                        </span>
                      )}
                    </button>
                  )}
                </>
              )}
              {user?.role === "admin" && (
                <>
                  <Link href="/profile" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("myProfile")}
                  </Link>
                  <Link href="/profile/edit" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("changeProfileInformation")}
                  </Link>
                  <Link href="/profile/password" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("changePassword")}
                  </Link>
                  <Link href="/admin/users" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("users")}
                  </Link>
                </>
              )}
              {user?.role === "superadmin" && (
                <>
                  <Link href="/profile" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("myProfile")}
                  </Link>
                  <Link href="/profile/password" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("changePassword")}
                  </Link>
                  <Link href="/admin/users" onClick={onClose} className="label-md text-on-surface-variant">
                    {t("users")}
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={() => logoutAndRedirect()}
                className="label-md text-start text-error"
              >
                {t("logOut")}
              </button>
            </div>
          ) : (
            <Link href="/auth/login" onClick={onClose} className="title-lg text-primary">
              {t("logIn")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
