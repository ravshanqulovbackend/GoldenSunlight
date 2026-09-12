"use client";

import { useTranslations } from "next-intl";
import { useFavorites } from "@/lib/query/hooks/useFavorites";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function WishlistPage() {
  const t = useTranslations("Wishlist");
  const tCommon = useTranslations("Common");
  const { data, isLoading, isError, refetch } = useFavorites();

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: tCommon("home"), href: "/" }, { label: t("title") }]} />
      <h1 className="headline-md mt-4 text-on-surface">{t("title")}</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && data.results.length === 0 && (
        <EmptyState
          icon="favorite"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actionHref="/products"
          actionLabel={t("viewProducts")}
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
