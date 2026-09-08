"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

function getMenuActions(role: string | undefined): MenuAction[] {
  const passwordItem: MenuAction = { label: "Change password", icon: "lock_reset", href: "/profile/password" };
  const usersItem: MenuAction = {
    label: "Admin Panel",
    icon: "group",
    href: role === "superadmin" ? "/admin/dashboard" : "/admin/orders",
  };
  const editInfoItem: MenuAction = {
    label: role === "staff" ? "Edit information" : "Change profile information",
    icon: "edit",
    href: "/profile",
  };
  const logoutItem: MenuAction = { label: "Log Out", icon: "logout", onClick: () => logoutAndRedirect(), danger: true };

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

  const actions = getMenuActions(user?.role);

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        {children}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 z-50 w-64 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg",
            placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
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
              "flex w-full items-center gap-3 px-4 py-3 label-md text-left transition-colors hover:bg-surface-container-high",
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
