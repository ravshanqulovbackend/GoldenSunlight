import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/money";
import type { Locale } from "@/i18n/config";

export function CartSummary({ totalPrice, totalItems }: { totalPrice: number; totalItems: number }) {
  const t = useTranslations("Cart");
  const locale = useLocale() as Locale;
  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="title-lg text-on-surface">{t("orderSummary")}</h2>
      <div className="flex items-center justify-between body-md text-on-surface-variant">
        <span>{t("productsCount", { count: totalItems })}</span>
        <span>{formatPrice(totalPrice, locale)}</span>
      </div>
      <p className="label-sm text-on-surface-variant">{t("noDeliveryFee")}</p>
      <div className="flex items-center justify-between border-t border-outline-variant pt-4 title-lg text-on-surface">
        <span>{t("total")}</span>
        <span className="text-primary">{formatPrice(totalPrice, locale)}</span>
      </div>
      <Link href="/checkout" className={buttonVariants("primary", "lg")}>
        {t("placeOrder")}
      </Link>
    </Card>
  );
}
