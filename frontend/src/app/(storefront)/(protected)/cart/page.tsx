"use client";

import { useCart } from "@/lib/query/hooks/useCart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="headline-md mt-4 text-on-surface">Cart</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {cart && cart.items.length === 0 && (
        <EmptyState
          icon="shopping_cart"
          title="Your cart is empty"
          description="Choose a product you like from the catalog."
          actionHref="/products"
          actionLabel="View Products"
        />
      )}

      {cart && cart.items.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
          <div>
            <CartSummary totalPrice={cart.total_price} totalItems={cart.total_items} />
          </div>
        </div>
      )}
    </div>
  );
}
