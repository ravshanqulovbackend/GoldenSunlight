"use client";

import { LOCALE_COOKIE, dirForLocale, type Locale } from "./config";

/**
 * Flips the visible `<html>` direction immediately (before the server round-trip
 * finishes) so the toggle feels instant, then persists the choice and asks Next.js
 * to re-render server components (which read the cookie via next-intl) with it.
 */
export function switchLocale(locale: Locale, router: { refresh: () => void }) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = locale;
  document.documentElement.dir = dirForLocale(locale);
  router.refresh();
}
