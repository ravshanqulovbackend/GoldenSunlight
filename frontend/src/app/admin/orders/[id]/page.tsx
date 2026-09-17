"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useAdminOrder,
  useUpdateOrderStatus,
  useUpdateOrderItemQuantity,
  useRemoveOrderItem,
  useAddOrderItem,
  useNotifyOrderReady,
} from "@/lib/query/hooks/useAdminOrders";
import { getAdminProducts } from "@/lib/api/endpoints/adminProducts";
import { NotificationSeenTicks } from "@/components/admin/orders/NotificationSeenTicks";
import { AppImage } from "@/components/ui/AppImage";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { getImageUrl } from "@/lib/utils/image";
import { formatDate, formatPrice } from "@/lib/utils/money";
import { orderStatusTone } from "@/lib/utils/orderStatusTone";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type Order, type OrderItem, type OrderStatus } from "@/types/order";

function ItemRow({ order, item }: { order: Order; item: OrderItem }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [confirming, setConfirming] = useState(false);
  const updateQuantity = useUpdateOrderItemQuantity(order.id);
  const removeItem = useRemoveOrderItem(order.id);
  const isTerminal = ["ready", "cancelled", "refunded"].includes(order.status);

  return (
    <li className="flex flex-col gap-3 border-b border-outline-variant pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant">
          {item.product ? (
            <AppImage src={getImageUrl(item.product.image)} alt={item.product.name} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-container-high text-on-surface-variant">
              <Icon name="inventory_2" className="text-[24px]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="label-md line-clamp-2-custom text-on-surface">{item.product?.name || item.product_name || "Product deleted"}</p>
          <p className="label-sm text-on-surface-variant">{formatPrice(item.price)} / unit</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:shrink-0 sm:justify-end sm:gap-3">
        {!isTerminal && (
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="h-10 w-20 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 body-md focus:border-secondary focus:outline-none"
          />
        )}
        {!isTerminal && quantity !== item.quantity && (
          <Button
            size="sm"
            disabled={updateQuantity.isPending}
            onClick={() => updateQuantity.mutate({ itemId: item.id, quantity })}
          >
            Save
          </Button>
        )}
        {isTerminal && <span className="label-md text-on-surface-variant">{item.quantity} pcs</span>}

        <span className="title-lg shrink-0 text-primary sm:w-24 sm:text-end">{formatPrice(item.subtotal)}</span>

        {!isTerminal &&
          (confirming ? (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="danger" disabled={removeItem.isPending} onClick={() => removeItem.mutate(item.id)}>
                Yes
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                No
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="Delete"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
            >
              <Icon name="delete" className="text-[18px]" />
            </button>
          ))}
      </div>
    </li>
  );
}

function AddItemForm({ order }: { order: Order }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useAddOrderItem(order.id);

  const { data: results } = useQuery({
    queryKey: ["admin-order-product-search", search],
    queryFn: () => getAdminProducts({ search, page: 1 }),
    enabled: search.length > 1,
  });

  return (
    <div className="flex flex-wrap items-end gap-2 border-t border-outline-variant pt-4">
      <div className="flex-1 min-w-[200px]">
        <Input
          label="Search product"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedId(null);
          }}
          placeholder="Product name..."
        />
        {results && results.results.length > 0 && !selectedId && (
          <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest">
            {results.results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedId(p.id);
                  setSearch(p.name);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-start label-md hover:bg-surface-container-high"
              >
                <span>{p.name}</span>
                <span className="text-on-surface-variant">{formatPrice(p.price)} • {p.stock} pcs</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="h-11 w-20 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 body-md focus:border-secondary focus:outline-none"
      />
      <Button
        type="button"
        disabled={!selectedId || addItem.isPending}
        onClick={() => {
          if (!selectedId) return;
          addItem.mutate({ productId: selectedId, quantity }, { onSuccess: () => { setSearch(""); setSelectedId(null); setQuantity(1); } });
        }}
      >
        Add
      </Button>
    </div>
  );
}

function StatusForm({ order }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number);
  const updateStatus = useUpdateOrderStatus(order.id);
  const notifyReady = useNotifyOrderReady(order.id);
  const isReady = order.status === "ready";
  const canNotify = !["cancelled", "refunded"].includes(order.status);

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="title-lg text-on-surface">Status</h2>
      <Select label="Order status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input label="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
      <Button
        disabled={updateStatus.isPending}
        onClick={() => updateStatus.mutate({ status, trackingNumber })}
      >
        Save
      </Button>

      <div className="border-t border-outline-variant pt-4">
        <Button
          variant="outline"
          className="w-full"
          disabled={notifyReady.isPending || !canNotify}
          onClick={() => notifyReady.mutate()}
        >
          <Icon name="notifications_active" className="text-[18px]" />
          {isReady ? "Notify again" : "Mark as Ready & Notify"}
        </Button>
      </div>
    </Card>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { data: order, isLoading, isError, refetch } = useAdminOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }
  if (isError || !order) {
    return <ErrorState title="Order not found" onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Orders", href: "/admin/orders" }, { label: `#${order.id}` }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="headline-md text-on-surface">Order #{order.id}</h1>
          <p className="label-md text-on-surface-variant">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={orderStatusTone(order.status)}>{order.status_display}</Badge>
          <NotificationSeenTicks order={order} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="title-lg mb-4 text-on-surface">Products</h2>
            <ul className="flex flex-col gap-4">
              {order.items.map((item) => (
                <ItemRow key={item.id} order={order} item={item} />
              ))}
            </ul>
            {!["ready", "cancelled", "refunded"].includes(order.status) && <AddItemForm order={order} />}
          </Card>

          <Card className="flex flex-col gap-2 p-6">
            <h2 className="title-lg mb-2 text-on-surface">Customer</h2>
            <p className="body-md text-on-surface-variant">
              {order.full_name} • {order.phone}
              {order.username && (
                <>
                  {" • "}
                  <Link href={`/admin/users/${order.user}`} className="text-primary hover:underline">
                    @{order.username}
                  </Link>
                </>
              )}
            </p>
            <p className="body-md text-on-surface-variant">{order.address_text || "Saved address"}</p>
            {order.landmark && <p className="body-md text-on-surface-variant">Landmark: {order.landmark}</p>}
            {order.notes && <p className="body-md text-on-surface-variant">Note: {order.notes}</p>}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <StatusForm key={`${order.status}-${order.tracking_number}`} order={order} />

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
          </Card>
        </div>
      </div>
    </div>
  );
}
