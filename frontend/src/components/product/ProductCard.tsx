"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AppImage } from "@/components/ui/AppImage";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { getImageUrl } from "@/lib/utils/image";
import { formatPrice } from "@/lib/utils/money";
import { pickLocalized } from "@/lib/utils/i18n";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAddToCart } from "@/lib/query/hooks/useCart";
import { useFavorites, useToggleFavorite } from "@/lib/query/hooks/useFavorites";
import type { ProductListItem } from "@/types/product";
import type { Locale } from "@/i18n/config";

export function ProductCard({ product }: { product: ProductListItem }) {
  const t = useTranslations("Products");
  const locale = useLocale() as Locale;
  const name = pickLocalized(product.name, product.name_ar, locale);
  const badge = pickLocalized(product.badge, product.badge_ar, locale);
  const router = useRouter();
  const access = useAuthStore((s) => s.access);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();
  const { data: favorites } = useFavorites();
  const isFavorite = favorites?.results.some((f) => f.product.id === product.id) ?? false;

  function requireAuth(action: () => void) {
    if (!isHydrated) return;
    if (!access) {
      router.push(`/auth/login?next=${encodeURIComponent("/products")}`);
      return;
    }
    action();
  }

  return (
    <article className="gs-lift group flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-[0_4px_20px_-5px_rgba(47,6,8,0.1)] hover:border-primary/30 hover:shadow-[0_18px_40px_-12px_rgba(11,77,163,0.28)]">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <AppImage
            src={getImageUrl(product.image)}
            alt={name}
            className="h-full w-full transition-transform duration-[600ms] ease-soft group-hover:scale-110"
          />
        </Link>
        {/* Rasm ustidan hover'da o'tuvchi yumshoq yorug'lik — karta "jonlanadi" */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 ease-soft group-hover:opacity-100"
        />

        {(badge || product.discount_percent > 0) && (
          <div className="absolute start-2 top-2 animate-pop-in sm:start-3 sm:top-3">
            <Badge tone={product.badge === "Yangi" ? "tertiary" : "secondary"}>
              {badge || `-${product.discount_percent}%`}
            </Badge>
          </div>
        )}

        <button
          type="button"
          onClick={() => requireAuth(() => toggleFavorite.mutate(product.id))}
          aria-label={isFavorite ? t("removeFromWishlist") : t("addToWishlist")}
          disabled={toggleFavorite.isPending}
          className={cn(
            "gs-icon-btn absolute end-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur-sm hover:bg-surface sm:end-3 sm:top-3 sm:h-9 sm:w-9",
            // Desktopda karta ustiga kelinganda yuqoridan sirg'alib chiqadi.
            isFavorite
              ? "opacity-100"
              : "opacity-100 md:-translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          )}
        >
          <Icon
            name="favorite"
            filled={isFavorite}
            className={cn(
              "text-[18px] transition-transform duration-300 ease-spring sm:text-[20px]",
              isFavorite ? "scale-110 text-error" : "text-primary"
            )}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <span className="label-sm truncate text-on-surface-variant">
          {pickLocalized(product.category_name, product.category_name_ar, locale)}
        </span>
        <Link
          href={`/products/${product.slug}`}
          className="title-lg line-clamp-2-custom text-on-surface transition-colors duration-200 hover:text-primary"
        >
          {name}
        </Link>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 label-sm normal-case text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Icon name="inventory_2" className="text-[16px]" />
            {product.is_in_stock ? t("inStock") : t("outOfStock")}
          </span>
          {product.review_count > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="star" className="icon-fill text-[16px] text-secondary" />
              {product.rating} ({product.review_count})
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-outline-variant pt-3">
          <div className="flex min-w-0 flex-col">
            {product.old_price && (
              <span className="label-sm truncate text-on-surface-variant line-through">
                {formatPrice(product.old_price, locale)}
              </span>
            )}
            <span className="title-lg truncate text-primary">{formatPrice(product.price, locale)}</span>
          </div>
          <button
            type="button"
            onClick={() => requireAuth(() => addToCart.mutate({ product_id: product.id }))}
            disabled={!product.is_in_stock || addToCart.isPending}
            aria-label={t("addToCart")}
            className="gs-press flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md hover:shadow-primary/30 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Icon name="add_shopping_cart" className="text-[18px] sm:text-[20px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
