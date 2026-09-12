"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { switchLocale } from "@/i18n/switchLocale";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/config";

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const next: Locale = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => switchLocale(next, router)}
      aria-label={next === "ar" ? "التبديل إلى العربية" : "Switch to English"}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-full border border-outline-variant px-2 label-md text-on-surface hover:bg-surface-container-low sm:h-10",
        className
      )}
    >
      {next === "ar" ? "عربي" : "EN"}
    </button>
  );
}
