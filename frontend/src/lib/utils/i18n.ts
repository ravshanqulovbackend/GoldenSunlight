import type { Locale } from "@/i18n/config";

/**
 * Admin-authored content (products, categories, news, company info) stores English
 * in the base field and Arabic in a `_ar` sibling that starts out empty until an
 * admin translates it. Falling back to English here — instead of showing blank
 * text — is what keeps the Arabic site error-free for content nobody has
 * translated yet.
 */
export function pickLocalized(
  en: string | null | undefined,
  ar: string | null | undefined,
  locale: Locale
): string {
  if (locale === "ar" && ar && ar.trim()) return ar;
  return en ?? "";
}
