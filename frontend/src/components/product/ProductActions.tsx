"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAddToCart } from "@/lib/query/hooks/useCart";
import { useToggleFavorite } from "@/lib/query/hooks/useFavorites";
import { formatPrice } from "@/lib/utils/money";
import type { ProductDetail } from "@/types/product";
import type { Locale } from "@/i18n/config";

export function ProductActions({ product }: { product: ProductDetail }) {
  const t = useTranslations("Products");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const access = useAuthStore((s) => s.access);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();
  const unitPrice = parseFloat(product.price) || 0;

  function requireAuth(action: () => void) {
    if (!isHydrated) return;
    if (!access) {
      router.push(`/auth/login?next=${encodeURIComponent(`/products/${product.slug}`)}`);
      return;
    }
    action();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Miqdor o'zgarganda jami summa shu yerda qayta hisoblanadi — sarlavhadagi narx
          bir dona uchun bo'lib qoladi. Balandlik ikki holatda ham bir xil (breakdown
          faqat qty > 1 da qo'shiladi) — shuning uchun + bosilganda layout siljimaydi. */}
      <div className="flex items-baseline gap-2">
        <span className="title-lg text-on-surface">{t("lineTotal", { total: formatPrice(unitPrice * quantity, locale) })}</span>
        {quantity > 1 && (
          <span className="label-md text-on-surface-variant">
            {t("lineTotalBreakdown", { quantity: String(quantity), unit: formatPrice(unitPrice, locale) })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={product.stock} />
        <Button
          size="lg"
          className="flex-1"
          disabled={!product.is_in_stock || addToCart.isPending}
          onClick={() => requireAuth(() => addToCart.mutate({ product_id: product.id, quantity }))}
        >
          <Icon name="add_shopping_cart" className="text-[20px]" />
          {product.is_in_stock ? t("addToCart") : t("outOfStock")}
        </Button>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={toggleFavorite.isPending}
          onClick={() => requireAuth(() => toggleFavorite.mutate(product.id))}
        >
          <Icon name="favorite" className="text-[18px]" />
          {t("wishlist")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <Icon name="share" className="text-[18px]" />
          {t("share")}
        </Button>
      </div>
    </div>
  );
}
