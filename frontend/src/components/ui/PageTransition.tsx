"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Har bir marshrut almashganda sahifa kontentini qaytadan "kirish" animatsiyasi
 * bilan ko'rsatadi.
 *
 * Ishlash printsipi: `key={pathname}` — pathname o'zgarganda React ichki `div`ni
 * butunlay yangisiga almashtiradi, shuning uchun `.gs-page` CSS animatsiyasi har
 * safar boshidan ijro etiladi (CSS animatsiyasi faqat element mount bo'lganda
 * boshlanadi — `key`siz u faqat birinchi yuklashda ishlagan bo'lardi).
 *
 * `children` prop sifatida uzatilgani uchun sahifalarning o'zi Server Component
 * bo'lib qolaveradi — bu klass komponent daraxtiga "client" chegarasini
 * kiritmaydi.
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={cn("gs-page", className)}>
      {children}
    </div>
  );
}
