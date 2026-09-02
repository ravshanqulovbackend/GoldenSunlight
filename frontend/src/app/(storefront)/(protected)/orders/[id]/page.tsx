"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useOrder, useCancelOrder } from "@/lib/query/hooks/useOrders";
import { AppImage } from "@/components/ui/AppImage";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { getImageUrl } from "@/lib/utils/image";
import { formatDate, formatPrice } from "@/lib/utils/money";
import { orderStatusTone } from "@/lib/utils/orderStatusTone";
import { PAYMENT_METHOD_LABELS } from "@/types/order";

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const cancelOrder = useCancelOrder();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
        <ErrorState title="Order not found" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Orders", href: "/orders" }, { label: `#${order.id}` }]} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="headline-md text-on-surface">Order #{order.id}</h1>
        <Badge tone={orderStatusTone(order.status)}>{order.status_display}</Badge>
      </div>
      <p className="label-md mt-1 text-on-surface-variant">{formatDate(order.created_at)}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="p-6">
            <h2 className="title-lg mb-4 text-on-surface">Products</h2>
            <ul className="flex flex-col gap-4">
              {order.items.map((item) =>
                item.product ? (
                  <li key={item.id} className="flex items-center gap-4">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant"
                    >
                      <AppImage src={getImageUrl(item.product.image)} alt={item.product.name} className="h-full w-full" />
                    </Link>
                    <div className="flex-1">
                      <p className="label-md text-on-surface">{item.product.name}</p>
                      <p className="label-sm text-on-surface-variant">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="title-lg text-primary">{formatPrice(item.subtotal)}</span>
                  </li>
                ) : (
                  <li key={item.id} className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant">
                      <Icon name="inventory_2" className="text-[24px]" />
                    </div>
                    <div className="flex-1">
                      <p className="label-md text-on-surface-variant">{item.product_name || "Product deleted"}</p>
                      <p className="label-sm text-on-surface-variant">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="title-lg text-primary">{formatPrice(item.subtotal)}</span>
                  </li>
                )
              )}
            </ul>
          </Card>

          <Card className="flex flex-col gap-2 p-6">
            <h2 className="title-lg mb-2 text-on-surface">Delivery</h2>
            <p className="body-md text-on-surface-variant">{order.full_name} • {order.phone}</p>
            <p className="body-md text-on-surface-variant">{order.address_text || "Saved address"}</p>
            {order.landmark && <p className="body-md text-on-surface-variant">Landmark: {order.landmark}</p>}
            {order.notes && <p className="body-md text-on-surface-variant">Comment: {order.notes}</p>}
            {order.tracking_number && (
              <p className="label-md text-on-surface">Tracking number: {order.tracking_number}</p>
            )}
          </Card>
        </div>

        <Card className="flex flex-col gap-3 p-6">
          <h2 className="title-lg text-on-surface">Payment</h2>
          <div className="flex justify-between body-md text-on-surface-variant">
            <span>Method</span>
            <span>{PAYMENT_METHOD_LABELS[order.payment_method]}</span>
          </div>
          <div className="flex justify-between body-md text-on-surface-variant">
            <span>Products</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between body-md text-on-surface-variant">
            <span>Delivery</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between body-md text-primary">
              <span>Discount</span>
              <span>-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-outline-variant pt-3 title-lg text-on-surface">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.total_amount)}</span>
          </div>

          {CANCELLABLE_STATUSES.includes(order.status) && (
            <Button
              variant="danger"
              className="mt-2"
              disabled={cancelOrder.isPending}
              onClick={() => cancelOrder.mutate(order.id)}
            >
              Cancel Order
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
