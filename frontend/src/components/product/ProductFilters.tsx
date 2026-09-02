"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildProductsHref } from "@/lib/utils/searchParams";
import type { Category } from "@/types/category";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const [priceMin, setPriceMin] = useState(searchParams.get("price_min") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("price_max") ?? "");

  function go(updates: Record<string, string | null>) {
    router.push(buildProductsHref(searchParams, updates));
  }

  return (
    <div className="flex w-full flex-col gap-4 md:w-64">
      <Card className="p-5">
        <h3 className="label-sm mb-4 uppercase text-on-surface-variant">Categories</h3>
        <div className="flex flex-col gap-2">
          <Chip selected={!activeCategory} onClick={() => go({ category: null })} className="justify-start">
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={activeCategory === category.slug}
              onClick={() => go({ category: activeCategory === category.slug ? null : category.slug })}
              className="justify-start"
            >
              {category.name} ({category.product_count})
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="label-sm mb-4 uppercase text-on-surface-variant">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-10 w-full rounded-lg border border-outline-variant px-3 body-md"
          />
          <span className="text-on-surface-variant">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-10 w-full rounded-lg border border-outline-variant px-3 body-md"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => go({ price_min: priceMin || null, price_max: priceMax || null })}
        >
          Apply
        </Button>
      </Card>
    </div>
  );
}
