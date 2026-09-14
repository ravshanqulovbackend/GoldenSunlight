import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getProduct, getRelatedProducts } from "@/lib/api/endpoints/products";
import { getProductReviews } from "@/lib/api/endpoints/reviews";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductTabs } from "@/components/product/ProductTabs";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ReviewForm } from "@/components/product/ReviewForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/utils/image";
import { formatDate, formatPrice } from "@/lib/utils/money";
import { pickLocalized } from "@/lib/utils/i18n";
import { ApiError } from "@/types/api";
import type { Locale } from "@/i18n/config";

interface ProductPageParams {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string) {
  try {
    return await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: ProductPageParams): Promise<Metadata> {
  const { slug } = await params;
  const [product, locale, t] = await Promise.all([loadProduct(slug), getLocale(), getTranslations("Products")]);
  if (!product) return { title: t("productNotFound") };
  const loc = locale as Locale;
  const name = pickLocalized(product.name, product.name_ar, loc);
  const description = pickLocalized(product.description, product.description_ar, loc);

  return {
    title: pickLocalized(product.meta_title, product.meta_title_ar, loc) || name,
    description: pickLocalized(product.meta_description, product.meta_description_ar, loc) || description.slice(0, 160),
    openGraph: {
      title: name,
      description: description.slice(0, 160),
      images: [getImageUrl(product.image)],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageParams) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const [related, reviews, t, tCommon, locale] = await Promise.all([
    getRelatedProducts(slug).catch(() => []),
    getProductReviews(product.id).catch(() => null),
    getTranslations("Products"),
    getTranslations("Common"),
    getLocale(),
  ]);
  const loc = locale as Locale;
  const name = pickLocalized(product.name, product.name_ar, loc);
  const description = pickLocalized(product.description, product.description_ar, loc);
  const ingredients = pickLocalized(product.ingredients, product.ingredients_ar, loc);
  const badge = pickLocalized(product.badge, product.badge_ar, loc);

  const galleryImages = [
    { src: getImageUrl(product.image), alt: name },
    ...product.images.map((img) => ({ src: getImageUrl(img.image), alt: img.alt_text || name })),
  ];

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb
        items={[
          { label: tCommon("home"), href: "/" },
          { label: tCommon("products"), href: "/products" },
          { label: name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="animate-fade-side lg:col-span-7">
          <ProductGallery images={galleryImages} />
        </div>

        {/* O'ng ustundagi ma'lumotlar ketma-ket ko'tariladi */}
        <div className="gs-stagger flex flex-col gap-4 lg:col-span-5">
          <span className="label-md text-on-surface-variant">
            {pickLocalized(product.category_name, product.category_name_ar, loc)}
          </span>
          <h1 className="headline-md text-on-surface">{name}</h1>

          <div className="flex items-center gap-3">
            {product.sku && <span className="label-sm text-on-surface-variant" dir="ltr">{t("skuLabel", { sku: product.sku })}</span>}
            {product.review_count > 0 && (
              <span className="flex items-center gap-1 label-md text-on-surface-variant">
                <Icon name="star" filled className="text-[18px] text-secondary" />
                {product.rating} ({product.review_count} {t("reviewsSuffix")})
              </span>
            )}
            {badge && <Badge tone="secondary">{badge}</Badge>}
          </div>

          <div className="flex items-baseline gap-3">
            {product.old_price && (
              <span className="body-lg text-on-surface-variant line-through">{formatPrice(product.old_price, loc)}</span>
            )}
            <span className="headline-md text-primary">{formatPrice(product.price, loc)}</span>
            {product.discount_percent > 0 && <Badge tone="error">-{product.discount_percent}%</Badge>}
          </div>

          <ProductActions product={product} />

          <div className="mt-2 flex flex-col gap-2 rounded-lg bg-surface-container-low p-4">
            <div className="flex items-center gap-2 label-md text-on-surface-variant">
              <Icon name="verified" className="text-[18px] text-secondary" />
              {t("certifiedQuality")}
            </div>
            <div className="flex items-center gap-2 label-md text-on-surface-variant">
              <Icon name="storefront" className="text-[18px] text-secondary" />
              {t("readyForPickup")}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <ProductTabs description={description} ingredients={ingredients} />
      </div>

      <div className="mt-14">
        <h2 className="headline-md mb-6 text-on-surface">{t("customerReviews")}</h2>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {reviews && reviews.results.length > 0 ? (
              <ul className="flex flex-col gap-6">
                {reviews.results.map((review) => (
                  <li key={review.id} className="border-b border-outline-variant pb-6">
                    <div className="flex items-center justify-between">
                      <span className="label-md font-semibold text-on-surface">{review.user_name}</span>
                      <span className="label-sm text-on-surface-variant">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="mt-1 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name="star"
                          filled={star <= review.rating}
                          className={`text-[16px] ${star <= review.rating ? "text-secondary" : "text-outline-variant"}`}
                        />
                      ))}
                    </div>
                    {review.comment && <p className="body-md mt-2 text-on-surface-variant">{review.comment}</p>}
                    {review.image && (
                      <a href={getImageUrl(review.image)} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(review.image)}
                          alt=""
                          className="mt-2 h-20 w-20 rounded-lg object-cover"
                        />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="body-md text-on-surface-variant">{t("noReviews")}</p>
            )}
          </div>
          <div>
            <ReviewForm productId={product.id} productSlug={product.slug} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="headline-md mb-6 text-on-surface">{t("youMightAlsoLike")}</h2>
          <RelatedProducts products={related} />
        </div>
      )}
    </div>
  );
}
