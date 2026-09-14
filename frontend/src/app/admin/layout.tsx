"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RequireAdmin } from "@/lib/guards/RequireAdmin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Icon } from "@/components/ui/Icon";
import { PageTransition } from "@/components/ui/PageTransition";
// import { LanguageToggle } from "@/components/layout/LanguageToggle"; // temporarily hidden — re-enable on request

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AdminNav");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-surface">
        <AdminSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-outline-variant bg-surface-container-low px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label={t("openMenu")}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-container-high"
          >
            <Icon name="menu" />
          </button>
          <span className="title-lg flex-1 text-primary">{t("adminPanel")}</span>
          {/* <LanguageToggle /> temporarily hidden — re-enable on request */}
        </header>

        <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:ms-64 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </RequireAdmin>
  );
}
