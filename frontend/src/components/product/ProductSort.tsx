"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { buildProductsHref } from "@/lib/utils/searchParams";

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest Products" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-rating", label: "By Rating" },
  { value: "name", label: "By Name" },
];

export function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("ordering") ?? "-created_at";

  return (
    <Select
      aria-label="Sort"
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
