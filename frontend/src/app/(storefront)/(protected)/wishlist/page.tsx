"use client";

import { useFavorites } from "@/lib/query/hooks/useFavorites";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function WishlistPage() {
  const { data, isLoading, isError, refetch } = useFavorites();

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <h1 className="headline-md mt-4 text-on-surface">Wishlist</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && data.results.length === 0 && (
        <EmptyState
          icon="favorite"
          title="Your wishlist is empty"
          description="Add products you like here using the heart icon."
          actionHref="/products"
          actionLabel="View Products"
        />
      )}

      {data && data.results.length > 0 && (
        <div className="mt-8">
          <ProductGrid products={data.results.map((favorite) => favorite.product)} />
        </div>
      )}
    </div>
  );
}
