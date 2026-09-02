"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppImage } from "@/components/ui/AppImage";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { getImageUrl } from "@/lib/utils/image";
import { formatPrice } from "@/lib/utils/money";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAddToCart } from "@/lib/query/hooks/useCart";
import { useFavorites, useToggleFavorite } from "@/lib/query/hooks/useFavorites";
import type { ProductListItem } from "@/types/product";

export function ProductCard({ product }: { product: ProductListItem }) {
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
    <article className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-[0_4px_20px_-5px_rgba(47,6,8,0.1)] transition-shadow hover:shadow-[0_10px_30px_-5px_rgba(47,6,8,0.15)]">
      <div className="relative h-64 overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <AppImage
            src={getImageUrl(product.image)}
            alt={product.name}
            className="h-full w-full transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {(product.badge || product.discount_percent > 0) && (
          <div className="absolute left-3 top-3">
            <Badge tone={product.badge === "Yangi" ? "tertiary" : "secondary"}>
              {product.badge || `-${product.discount_percent}%`}
            </Badge>
          </div>
        )}

        <button
          type="button"
          onClick={() => requireAuth(() => toggleFavorite.mutate(product.id))}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          disabled={toggleFavorite.isPending}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 transition-opacity hover:bg-surface",
            isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Icon
            name="favorite"
            filled={isFavorite}
            className={cn("text-[20px]", isFavorite ? "text-error" : "text-primary")}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="label-sm text-on-surface-variant">{product.category_name}</span>
        <Link href={`/products/${product.slug}`} className="title-lg text-on-surface hover:text-primary">
          {product.name}
        </Link>

        <div className="flex items-center gap-2 label-sm normal-case text-on-surface-variant">
          <Icon name="inventory_2" className="text-[16px]" />
          {product.is_in_stock ? "In Stock" : "Out of Stock"}
          {product.review_count > 0 && (
            <>
              <span className="text-outline">•</span>
              <Icon name="star" className="icon-fill text-[16px] text-secondary" />
              {product.rating} ({product.review_count})
            </>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3">
          <div className="flex flex-col">
            {product.old_price && (
              <span className="label-sm text-on-surface-variant line-through">{formatPrice(product.old_price)}</span>
            )}
            <span className="title-lg text-primary">{formatPrice(product.price)}</span>
          </div>
          <button
            type="button"
            onClick={() => requireAuth(() => addToCart.mutate({ product_id: product.id }))}
            disabled={!product.is_in_stock || addToCart.isPending}
            aria-label="Add to cart"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary transition-transform hover:brightness-110 active:scale-95 disabled:opacity-40"
          >
            <Icon name="add_shopping_cart" className="text-[20px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
