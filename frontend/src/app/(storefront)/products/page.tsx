import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProducts } from "@/lib/api/endpoints/products";
import { getCategories } from "@/lib/api/endpoints/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { Icon } from "@/components/ui/Icon";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { toProductFilters, type RawSearchParams } from "@/lib/utils/searchParams";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Products");
  return { title: t("catalogTitle") };
}

const PAGE_SIZE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const t = await getTranslations("Products");
  const tCommon = await getTranslations("Common");
  const raw = await searchParams;
  const filters = toProductFilters(raw);
  const currentPage = filters.page ?? 1;

  const [products, categories] = await Promise.all([
    getProducts(filters),
    getCategories().catch(() => []),
  ]);

  const totalPages = Math.max(1, Math.ceil(products.count / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: tCommon("home"), href: "/" }, { label: tCommon("products") }]} />
      <AnimatedText as="h1" text={t("catalogTitle")} delay={0.06} className="headline-md mt-4 text-on-surface" />

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <ProductFilters categories={categories} />

        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form action="/products" method="get" className="group/search relative w-full md:max-w-sm">
              {Object.entries(raw)
                .filter(([key]) => key !== "search" && key !== "page")
                .map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={Array.isArray(value) ? value[0] : value} />
                ))}
              <Icon name="search" className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant transition-colors duration-250 group-focus-within/search:text-secondary" />
              <input
                type="search"
                name="search"
                defaultValue={filters.search}
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-full border border-outline-variant bg-surface-container-lowest ps-11 pe-4 body-md transition-[border-color,box-shadow] duration-250 ease-soft hover:border-outline focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim"
              />
            </form>
            <ProductSort />
          </div>

          <p className="label-md mb-4 animate-fade-in text-on-surface-variant">{t("countFound", { count: products.count })}</p>

          <ProductGrid products={products.results} />

          <div className="mt-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              buildHref={(page) => {
                const params = new URLSearchParams(
                  Object.entries(raw).flatMap(([key, value]) =>
                    value === undefined ? [] : [[key, Array.isArray(value) ? value[0]! : value]]
                  )
                );
                params.set("page", String(page));
                return `/products?${params.toString()}`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
