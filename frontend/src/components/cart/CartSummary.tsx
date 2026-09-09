import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/money";

export function CartSummary({ totalPrice, totalItems }: { totalPrice: number; totalItems: number }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="title-lg text-on-surface">Order Summary</h2>
      <div className="flex items-center justify-between body-md text-on-surface-variant">
        <span>Products ({totalItems})</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      <p className="label-sm text-on-surface-variant">No delivery fee — orders are ready for pickup at our store.</p>
      <div className="flex items-center justify-between border-t border-outline-variant pt-4 title-lg text-on-surface">
        <span>Total</span>
        <span className="text-primary">{formatPrice(totalPrice)}</span>
      </div>
      <Link href="/checkout" className={buttonVariants("primary", "lg")}>
        Place Order
      </Link>
    </Card>
  );
}
