import { getTranslations } from "next-intl/server";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ProductListItem } from "@/types/product";

export async function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    const t = await getTranslations("Products");
    return <EmptyState icon="search_off" title={t("noProductsFound")} description={t("adjustFilters")} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
