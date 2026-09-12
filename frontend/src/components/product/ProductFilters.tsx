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

  return (
    <div className="flex w-full flex-col gap-4 md:w-64">
      <Card className="p-5">
        <h3 className="label-sm mb-4 uppercase text-on-surface-variant">{t("categories")}</h3>
        <div className="flex flex-col gap-2">
          <Chip selected={!activeCategory} onClick={() => go({ category: null })} className="justify-start">
            {t("all")}
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={activeCategory === category.slug}
              onClick={() => go({ category: activeCategory === category.slug ? null : category.slug })}
              className="justify-start"
            >
              {pickLocalized(category.name, category.name_ar, locale)} ({category.product_count})
            </Chip>
          ))}
        </div>
      </Card>
    </div>
  );
}
