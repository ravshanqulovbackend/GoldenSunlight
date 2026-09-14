"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AppImage } from "@/components/ui/AppImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/utils/image";
import { formatPrice } from "@/lib/utils/money";
import { pickLocalized } from "@/lib/utils/i18n";
import { useRemoveCartItem, useUpdateCartItem } from "@/lib/query/hooks/useCart";
import type { CartItem } from "@/types/cart";
import type { Locale } from "@/i18n/config";

export function CartItemRow({ item }: { item: CartItem }) {
  const t = useTranslations("Cart");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const name = pickLocalized(item.product.name, item.product.name_ar, locale);

  return (
    <div className="group/row flex flex-col gap-3 border-b border-outline-variant py-4 transition-opacity duration-300 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <Link
          href={`/products/${item.product.slug}`}
          className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant transition-[border-color,scale] duration-300 ease-spring hover:scale-105 hover:border-primary sm:h-20 sm:w-20"
        >
          <AppImage src={getImageUrl(item.product.image)} alt={name} className="h-full w-full" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link href={`/products/${item.product.slug}`} className="label-md line-clamp-2-custom text-on-surface transition-colors duration-200 hover:text-primary">
            {name}
          </Link>
          <span className="title-lg text-primary">{formatPrice(item.product.price, locale)}</span>
          {!item.product.is_in_stock && <span className="label-sm text-error">{t("outOfStock")}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:justify-end sm:gap-4">
        <QuantityStepper
          value={item.quantity}
          max={item.product.stock}
          onChange={(quantity) => updateItem.mutate({ itemId: item.id, quantity })}
        />

        <span className="title-lg hidden w-24 text-end text-on-surface sm:block">{formatPrice(item.subtotal, locale)}</span>

        <button
          type="button"
          onClick={() => removeItem.mutate(item.id)}
          disabled={removeItem.isPending}
          aria-label={tCommon("delete")}
          className="gs-icon-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container disabled:opacity-40"
        >
          <Icon name="delete" className="text-[20px]" />
        </button>
      </div>
    </div>
  );
}
