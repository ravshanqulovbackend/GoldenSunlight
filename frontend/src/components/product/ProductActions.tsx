"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAddToCart } from "@/lib/query/hooks/useCart";
import { useToggleFavorite } from "@/lib/query/hooks/useFavorites";
import type { ProductDetail } from "@/types/product";

export function ProductActions({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const access = useAuthStore((s) => s.access);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

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
      <div className="flex items-center gap-4">
        <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={product.stock} />
        <Button
          size="lg"
          className="flex-1"
          disabled={!product.is_in_stock || addToCart.isPending}
          onClick={() => requireAuth(() => addToCart.mutate({ product_id: product.id, quantity }))}
        >
          <Icon name="add_shopping_cart" className="text-[20px]" />
          {product.is_in_stock ? "Add to Cart" : "Out of Stock"}
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
          Wishlist
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
          Share
        </Button>
      </div>
    </div>
  );
}
