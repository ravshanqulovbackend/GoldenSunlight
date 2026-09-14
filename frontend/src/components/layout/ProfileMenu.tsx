"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore, logoutAndRedirect } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils/cn";

interface MenuAction {
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

function getMenuActions(role: string | undefined, t: (key: string) => string): MenuAction[] {
  const passwordItem: MenuAction = { label: t("changePassword"), icon: "lock_reset", href: "/profile/password" };
  const usersItem: MenuAction = {
    label: t("adminPanel"),
    icon: "group",
    href: role === "superadmin" ? "/admin/dashboard" : "/admin/orders",
  };
  const editInfoItem: MenuAction = {
    label: role === "staff" ? t("editInformation") : t("changeProfileInformation"),
    icon: "edit",
    href: "/profile/edit",
  };
  const logoutItem: MenuAction = { label: t("logOut"), icon: "logout", onClick: () => logoutAndRedirect(), danger: true };

  if (role === "superadmin") return [passwordItem, usersItem, logoutItem];
  if (role === "admin") return [passwordItem, usersItem, editInfoItem, logoutItem];
  return [passwordItem, editInfoItem, logoutItem];
}

interface ProfileMenuProps {
  children: ReactNode;
  placement?: "top" | "bottom";
  panelClassName?: string;
}

/** Opens a role-appropriate actions menu when the profile badge/card is clicked. */
export function ProfileMenu({ children, placement = "bottom", panelClassName }: ProfileMenuProps) {
  const t = useTranslations("ProfileMenu");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const actions = getMenuActions(user?.role, t);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="gs-press"
      >
        {children}
      </button>

      {open && (
        <div
          role="menu"
          // Panel o'zi tugma tomondan "ochiladi" (scale + fade), ichidagi
          // elementlar esa `.gs-stagger` orqali ketma-ket paydo bo'ladi.
          className={cn(
            "absolute end-0 z-50 w-64 origin-top overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl",
            "gs-stagger animate-scale-in",
            placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2 origin-bottom",
            panelClassName
          )}
        >
          {actions.map((action) => {
            const content = (
              <>
                <Icon name={action.icon} className="text-[18px]" />
                {action.label}
              </>
            );
            const itemClassName = cn(
              "flex w-full items-center gap-3 px-4 py-3 label-md text-start",
              "transition-[background-color,color,padding] duration-200 ease-soft hover:ps-5 hover:bg-surface-container-high",
              action.danger ? "text-error" : "text-on-surface"
            );

            if (action.href) {
              return (
                <Link key={action.label} href={action.href} role="menuitem" className={itemClassName} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              );
            }
            return (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                className={itemClassName}
                onClick={() => {
                  setOpen(false);
                  action.onClick?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
