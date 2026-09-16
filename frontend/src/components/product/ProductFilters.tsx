"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { buildProductsHref } from "@/lib/utils/searchParams";
import { pickLocalized } from "@/lib/utils/i18n";
import type { Category } from "@/types/category";
import type { Locale } from "@/i18n/config";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const t = useTranslations("Products");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  function go(updates: Record<string, string | null>) {
    router.push(buildProductsHref(searchParams, updates));
  }

  const allChip = (
    <Chip key="all" selected={!activeCategory} onClick={() => go({ category: null })} className="shrink-0 justify-start whitespace-nowrap">
      {t("all")}
    </Chip>
  );
  const categoryChips = categories.map((category) => (
    <Chip
      key={category.id}
      selected={activeCategory === category.slug}
      onClick={() => go({ category: activeCategory === category.slug ? null : category.slug })}
      className="shrink-0 justify-start whitespace-nowrap"
    >
      {pickLocalized(category.name, category.name_ar, locale)} ({category.product_count})
    </Chip>
  ));

  return (
    <>
      {/*
       * Kategoriyalar ko'payib ketsa mobilda vertikal ro'yxat butun ekranni
       * egallab, mahsulotlarni ko'rish uchun ko'p skroll qildiradi — shuning
       * uchun mobilda gorizontal, bir qatorli suriladigan chip panjarasi
       * ishlatiladi (ekran chetlarigacha to'liq keladi). Planshet/desktopda
       * esa odatdagi vertikal yon panel qoladi.
       */}
      <div className="-mx-margin-mobile flex gap-2 overflow-x-auto px-margin-mobile pb-1 custom-scrollbar md:hidden">
        {allChip}
        {categoryChips}
      </div>

      <div className="hidden w-full flex-col gap-4 md:flex md:w-64">
        <Card className="p-5">
          <h3 className="label-sm mb-4 uppercase text-on-surface-variant">{t("categories")}</h3>
          <div className="gs-stagger flex flex-col gap-2">
            {allChip}
            {categoryChips}
          </div>
        </Card>
      </div>
    </>
  );
}
