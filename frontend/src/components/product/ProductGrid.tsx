import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ProductListItem } from "@/types/product";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return <EmptyState icon="search_off" title="No products found" description="Try adjusting your filters and search again." />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
