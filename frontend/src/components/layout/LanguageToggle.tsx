"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { switchLocale } from "@/i18n/switchLocale";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils/cn";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ar: "AR",
};

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(next: Locale) {
    setOpen(false);
    if (next !== locale) switchLocale(next, router);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="flex h-9 items-center justify-center gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 label-md text-on-surface hover:bg-surface-container-low sm:h-10"
      >
        {LOCALE_LABELS[locale]}
        <Icon name="expand_more" className={cn("text-[18px] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute top-full start-0 z-50 mt-2 min-w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-lg"
        >
          {locales.map((option) => {
            const active = option === locale;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => select(option)}
                  className={cn(
                    "w-full rounded-lg px-4 py-2 text-center label-md transition-colors",
                    active
                      ? "bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  )}
                >
                  {LOCALE_LABELS[option]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
