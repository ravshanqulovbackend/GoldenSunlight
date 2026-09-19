"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/query/hooks/useCart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { buttonVariants } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/money";
import type { Locale } from "@/i18n/config";

export default function CartPage() {
  const t = useTranslations("Cart");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const { data: cart, isLoading, isError, refetch } = useCart();
  const hasItems = !!cart && cart.items.length > 0;

  return (
    <div className={`mx-auto max-w-container-max-width px-margin-mobile pt-10 md:px-margin-desktop ${hasItems ? "pb-28 lg:pb-10" : "pb-10"}`}>
      <Breadcrumb items={[{ label: tCommon("home"), href: "/" }, { label: t("title") }]} />
      <h1 className="headline-md mt-4 text-on-surface">{t("title")}</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {cart && cart.items.length === 0 && (
        <EmptyState
          icon="shopping_bag"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actionHref="/products"
          actionLabel={t("viewProducts")}
        />
      )}

      {hasItems && cart && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
            {/* Desktop/tabletda to'liq xulosa karta ko'rinishida, mobilda esa
                pastdagi sticky panel bilan almashtiriladi (quyida). */}
            <div className="hidden lg:block">
              <CartSummary totalPrice={cart.total_price} totalItems={cart.total_items} />
            </div>
          </div>

          {/*
           * Mobilda savat ro'yxati uzun bo'lishi mumkin — "Buyurtma berish"ga
           * o'tish uchun eng pastgacha skroll qilishga majbur qilmaslik uchun
           * jami summa va CTA ekran pastida doim ko'rinib turadi.
           *
           * `[transform:translateZ(0)]` — forces its own GPU layer; otherwise WebKit
           * in-app WebViews (Telegram/Instagram) detach `fixed` + `backdrop-filter`
           * bars from the bottom during scroll (see ProductActions.tsx for detail).
           */}
          <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 animate-fade-up border-t border-outline-variant bg-surface/95 p-3 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.15)] backdrop-blur-md [transform:translateZ(0)] md:bottom-0 md:[padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
            <div className="mx-auto flex max-w-container-max-width items-center gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="label-sm truncate text-on-surface-variant">{t("productsCount", { count: cart.total_items })}</span>
                <span className="title-lg truncate text-primary">{formatPrice(cart.total_price, locale)}</span>
              </div>
              <Link href="/checkout" className={buttonVariants("primary", "md", "shrink-0")}>
                {t("placeOrder")}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
