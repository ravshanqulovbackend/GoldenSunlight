"use client";

import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/utils/image";
import { formatPrice } from "@/lib/utils/money";
import { useRemoveCartItem, useUpdateCartItem } from "@/lib/query/hooks/useCart";
import type { CartItem } from "@/types/cart";

export function CartItemRow({ item }: { item: CartItem }) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  return (
    <div className="flex items-center gap-4 border-b border-outline-variant py-4">
      <Link href={`/products/${item.product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-outline-variant">
        <AppImage src={getImageUrl(item.product.image)} alt={item.product.name} className="h-full w-full" />
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link href={`/products/${item.product.slug}`} className="label-md text-on-surface hover:text-primary">
          {item.product.name}
        </Link>
        <span className="title-lg text-primary">{formatPrice(item.product.price)}</span>
        {!item.product.is_in_stock && <span className="label-sm text-error">Out of stock</span>}
      </div>

      <QuantityStepper
        value={item.quantity}
        max={item.product.stock}
        onChange={(quantity) => updateItem.mutate({ itemId: item.id, quantity })}
      />

      <span className="title-lg hidden w-28 text-right text-on-surface sm:block">{formatPrice(item.subtotal)}</span>

      <button
        type="button"
        onClick={() => removeItem.mutate(item.id)}
        disabled={removeItem.isPending}
        aria-label="Delete"
        className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
      >
        <Icon name="delete" className="text-[20px]" />
      </button>
    </div>
  );
}
