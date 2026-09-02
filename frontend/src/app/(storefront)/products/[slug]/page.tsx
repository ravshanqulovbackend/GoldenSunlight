import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { ApiError } from "@/types/api";

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
  const product = await loadProduct(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [getImageUrl(product.image)],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageParams) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(slug).catch(() => []),
    getProductReviews(product.id).catch(() => null),
  ]);

  const galleryImages = [
    { src: getImageUrl(product.image), alt: product.name },
    ...product.images.map((img) => ({ src: getImageUrl(img.image), alt: img.alt_text || product.name })),
  ];

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProductGallery images={galleryImages} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <span className="label-md text-on-surface-variant">{product.category_name}</span>
          <h1 className="headline-md text-on-surface">{product.name}</h1>

          <div className="flex items-center gap-3">
            {product.sku && <span className="label-sm text-on-surface-variant">SKU: {product.sku}</span>}
            {product.review_count > 0 && (
              <span className="flex items-center gap-1 label-md text-on-surface-variant">
                <Icon name="star" filled className="text-[18px] text-secondary" />
                {product.rating} ({product.review_count} reviews)
              </span>
            )}
            {product.badge && <Badge tone="secondary">{product.badge}</Badge>}
          </div>

          <div className="flex items-baseline gap-3">
            {product.old_price && (
              <span className="body-lg text-on-surface-variant line-through">{formatPrice(product.old_price)}</span>
            )}
            <span className="headline-md text-primary">{formatPrice(product.price)}</span>
            {product.discount_percent > 0 && <Badge tone="error">-{product.discount_percent}%</Badge>}
          </div>

          <ProductActions product={product} />

          <div className="mt-2 flex flex-col gap-2 rounded-lg bg-surface-container-low p-4">
            <div className="flex items-center gap-2 label-md text-on-surface-variant">
              <Icon name="verified" className="text-[18px] text-secondary" />
              Certified for quality
            </div>
            <div className="flex items-center gap-2 label-md text-on-surface-variant">
              <Icon name="local_shipping" className="text-[18px] text-secondary" />
              Fast delivery across Tashkent
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <ProductTabs description={product.description} ingredients={product.ingredients} />
      </div>

      <div className="mt-14">
        <h2 className="headline-md mb-6 text-on-surface">Customer Reviews</h2>
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
                  </li>
                ))}
              </ul>
            ) : (
              <p className="body-md text-on-surface-variant">No reviews yet. Be the first to share your thoughts!</p>
            )}
          </div>
          <div>
            <ReviewForm productId={product.id} productSlug={product.slug} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="headline-md mb-6 text-on-surface">You Might Also Like</h2>
          <RelatedProducts products={related} />
        </div>
      )}
    </div>
  );
}
