"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useOrder, useCancelOrder } from "@/lib/query/hooks/useOrders";
import { AppImage } from "@/components/ui/AppImage";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { OrderStatusStepper } from "@/components/order/OrderStatusStepper";
import { getImageUrl } from "@/lib/utils/image";
import { formatDate, formatPrice } from "@/lib/utils/money";
import { pickLocalized } from "@/lib/utils/i18n";
import { orderStatusTone } from "@/lib/utils/orderStatusTone";
import { useOrderStatusLabels, usePaymentMethodLabels } from "@/lib/utils/orderLabels";
import type { Locale } from "@/i18n/config";

const CANCELLABLE_STATUSES = ["pending", "preparing"];

export default function OrderDetailPage() {
  const t = useTranslations("Orders");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const statusLabels = useOrderStatusLabels();
  const paymentMethodLabels = usePaymentMethodLabels();
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
        <ErrorState title={t("orderNotFound")} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb
        items={[
          { label: tCommon("home"), href: "/" },
          { label: t("title"), href: "/orders" },
          { label: `#${order.id}` },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="headline-md text-on-surface">{t("orderNumber", { id: order.id })}</h1>
        <Badge tone={orderStatusTone(order.status)}>{statusLabels[order.status]}</Badge>
      </div>
      <p className="label-md mt-1 text-on-surface-variant">{formatDate(order.created_at)}</p>

      <Card className="mt-6 overflow-x-auto p-6">
        <OrderStatusStepper status={order.status} />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="p-6">
            <h2 className="title-lg mb-4 text-on-surface">{t("products")}</h2>
            <ul className="flex flex-col gap-4">
              {order.items.map((item) => {
                const name = item.product
                  ? pickLocalized(item.product.name, item.product.name_ar, locale)
                  : item.product_name || t("productDeleted");
                return item.product ? (
                  <li key={item.id} className="flex items-center gap-4">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant"
                    >
                      <AppImage src={getImageUrl(item.product.image)} alt={name} className="h-full w-full" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="label-md line-clamp-2-custom text-on-surface">{name}</p>
                      <p className="label-sm text-on-surface-variant">
                        {item.quantity} x {formatPrice(item.price, locale)}
                      </p>
                    </div>
                    <span className="title-lg shrink-0 text-primary">{formatPrice(item.subtotal, locale)}</span>
                  </li>
                ) : (
                  <li key={item.id} className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant">
                      <Icon name="inventory_2" className="text-[24px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="label-md line-clamp-2-custom text-on-surface-variant">{name}</p>
                      <p className="label-sm text-on-surface-variant">
                        {item.quantity} x {formatPrice(item.price, locale)}
                      </p>
                    </div>
                    <span className="title-lg shrink-0 text-primary">{formatPrice(item.subtotal, locale)}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="flex flex-col gap-2 p-6">
            <h2 className="title-lg mb-2 text-on-surface">{t("customerInfo")}</h2>
            <p className="body-md text-on-surface-variant">{order.full_name} • {order.phone}</p>
            {order.address_text && <p className="body-md text-on-surface-variant">{order.address_text}</p>}
            {order.landmark && <p className="body-md text-on-surface-variant">{t("landmark", { landmark: order.landmark })}</p>}
            {order.notes && <p className="body-md text-on-surface-variant">{t("notes", { notes: order.notes })}</p>}
            {order.tracking_number && (
              <p className="label-md text-on-surface">{t("trackingNumber", { number: order.tracking_number })}</p>
            )}
          </Card>
        </div>

        <Card className="flex h-fit flex-col gap-3 p-6">
          <h2 className="title-lg text-on-surface">{t("payment")}</h2>
          <div className="flex justify-between body-md text-on-surface-variant">
            <span>{t("paymentMethod")}</span>
            <span>{paymentMethodLabels[order.payment_method]}</span>
          </div>
          <div className="flex justify-between body-md text-on-surface-variant">
            <span>{t("products")}</span>
            <span>{formatPrice(order.subtotal, locale)}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between body-md text-primary">
              <span>{t("discount")}</span>
              <span>-{formatPrice(order.discount_amount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-outline-variant pt-3 title-lg text-on-surface">
            <span>{t("total")}</span>
            <span className="text-primary">{formatPrice(order.total_amount, locale)}</span>
          </div>

          {CANCELLABLE_STATUSES.includes(order.status) && (
            <Button
              variant="danger"
              className="mt-2"
              disabled={cancelOrder.isPending}
              onClick={() => cancelOrder.mutate(order.id)}
            >
              {t("cancelOrder")}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
