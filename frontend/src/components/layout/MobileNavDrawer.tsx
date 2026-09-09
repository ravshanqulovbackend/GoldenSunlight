"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { logoutAndRedirect } from "@/lib/stores/authStore";
import type { User } from "@/types/auth";

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
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/50"
      />
      <div className="absolute right-0 top-0 flex h-full w-4/5 max-w-xs flex-col gap-6 bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="headline-md text-primary">Menu</span>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center">
            <Icon name="close" />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={onClose} className="title-lg text-on-surface hover:text-primary">
              {link.label}
            </Link>
          ))}
          <Link href="/wishlist" onClick={onClose} className="title-lg text-on-surface hover:text-primary">
            Wishlist
          </Link>
        </nav>

        <div className="mt-auto border-t border-outline-variant pt-6">
          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <p className="label-sm uppercase text-on-surface-variant">
                {user?.first_name || user?.username || "Profile"}
              </p>
              {user?.role === "staff" && (
                <>
                  <Link href="/profile" onClick={onClose} className="label-md text-on-surface-variant">
                    Edit information
                  </Link>
                  <Link href="/profile/password" onClick={onClose} className="label-md text-on-surface-variant">
                    Change password
                  </Link>
                  <Link href="/orders" onClick={onClose} className="label-md text-on-surface-variant">
                    My Orders
                  </Link>
                  <Link href="/notifications" onClick={onClose} className="label-md text-on-surface-variant">
                    Notifications
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
                      Report an issue
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
                    Change profile information
                  </Link>
                  <Link href="/profile/password" onClick={onClose} className="label-md text-on-surface-variant">
                    Change password
                  </Link>
                  <Link href="/admin/users" onClick={onClose} className="label-md text-on-surface-variant">
                    Users
                  </Link>
                </>
              )}
              {user?.role === "superadmin" && (
                <>
                  <Link href="/profile/password" onClick={onClose} className="label-md text-on-surface-variant">
                    Change password
                  </Link>
                  <Link href="/admin/users" onClick={onClose} className="label-md text-on-surface-variant">
                    Users
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={() => logoutAndRedirect()}
                className="label-md text-left text-error"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link href="/auth/login" onClick={onClose} className="title-lg text-primary">
              Log In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
