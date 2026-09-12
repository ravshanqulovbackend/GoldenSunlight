"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useOrders } from "@/lib/query/hooks/useOrders";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate, formatPrice } from "@/lib/utils/money";
import { getImageUrl } from "@/lib/utils/image";
import { pickLocalized } from "@/lib/utils/i18n";
import { orderStatusTone } from "@/lib/utils/orderStatusTone";
import { useOrderStatusLabels } from "@/lib/utils/orderLabels";
import type { Order } from "@/types/order";
import type { Locale } from "@/i18n/config";

const THUMBNAIL_LIMIT = 4;

function OrderThumbnails({ order }: { order: Order }) {
  const t = useTranslations("Orders");
  const locale = useLocale() as Locale;
  const items = order.items;
  const shown = items.slice(0, THUMBNAIL_LIMIT);
  const extra = items.length - shown.length;

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {shown.map((item) => (
          <div
            key={item.id}
            className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-surface-container-lowest bg-surface-container-high"
          >
            {item.product ? (
              <AppImage
                src={getImageUrl(item.product.image)}
                alt={pickLocalized(item.product.name, item.product.name_ar, locale)}
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
                <Icon name="inventory_2" className="text-[16px]" />
              </div>
            )}
          </div>
        ))}
        {extra > 0 && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-surface-container-high label-sm font-semibold text-on-surface-variant">
            +{extra}
          </div>
        )}
      </div>
      <span className="label-sm text-on-surface-variant">{t("itemsCount", { count: items.length })}</span>
    </div>
  );
}

export default function OrdersPage() {
  const t = useTranslations("Orders");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const statusLabels = useOrderStatusLabels();
  const { data, isLoading, isError, refetch } = useOrders();

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: tCommon("home"), href: "/" }, { label: t("title") }]} />
      <h1 className="headline-md mt-4 text-on-surface">{t("title")}</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState title={t("loadError")} onRetry={() => refetch()} />}

      {data && data.results.length === 0 && (
        <EmptyState
          icon="receipt_long"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actionHref="/products"
          actionLabel={t("startShopping")}
        />
      )}

      {data && data.results.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {data.results.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="flex flex-col gap-4 p-5 transition-colors hover:border-primary hover:bg-surface-container-low">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <p className="label-md font-semibold text-on-surface">{t("orderNumber", { id: order.id })}</p>
                    <Badge tone={orderStatusTone(order.status)}>{statusLabels[order.status]}</Badge>
                  </div>
                  <span className="label-sm text-on-surface-variant">{formatDate(order.created_at)}</span>
                </div>

                <OrderThumbnails order={order} />

                <div className="flex items-center justify-between border-t border-outline-variant pt-3">
                  <span className="title-lg text-primary">{formatPrice(order.total_amount, locale)}</span>
                  <span className="label-md flex items-center gap-1 text-on-surface-variant">
                    {t("details")}
                    <Icon name="chevron_right" className="text-[18px]" mirrorInRtl />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
