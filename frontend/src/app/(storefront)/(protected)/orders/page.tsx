"use client";

import Link from "next/link";
import { useOrders } from "@/lib/query/hooks/useOrders";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate, formatPrice } from "@/lib/utils/money";
import { orderStatusTone } from "@/lib/utils/orderStatusTone";

export default function OrdersPage() {
  const { data, isLoading, isError, refetch } = useOrders();

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Orders" }]} />
      <h1 className="headline-md mt-4 text-on-surface">My Orders</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && data.results.length === 0 && (
        <EmptyState
          icon="receipt_long"
          title="No orders"
          description="You haven't placed any orders yet."
          actionHref="/products"
          actionLabel="Start Shopping"
        />
      )}

      {data && data.results.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {data.results.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="flex flex-col gap-2 p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="label-md font-semibold text-on-surface">Order #{order.id}</p>
                  <p className="label-sm text-on-surface-variant">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge tone={orderStatusTone(order.status)}>{order.status_display}</Badge>
                  <span className="title-lg text-primary">{formatPrice(order.total_amount)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
