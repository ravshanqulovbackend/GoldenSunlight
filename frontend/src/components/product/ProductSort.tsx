"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/Select";
import { buildProductsHref } from "@/lib/utils/searchParams";

export function ProductSort() {
  const t = useTranslations("Products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("ordering") ?? "-created_at";

  const SORT_OPTIONS = [
    { value: "-created_at", label: t("sortNewest") },
    { value: "price", label: t("sortPriceLowHigh") },
    { value: "-price", label: t("sortPriceHighLow") },
    { value: "-rating", label: t("sortRating") },
    { value: "name", label: t("sortName") },
  ];

  return (
    <Select
      aria-label={t("sortLabel")}
      value={current}
      onChange={(e) => router.push(buildProductsHref(searchParams, { ordering: e.target.value }))}
      className="w-full md:w-56"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
