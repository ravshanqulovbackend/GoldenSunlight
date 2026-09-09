import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/utils/image";
import { formatPrice } from "@/lib/utils/money";
import type { ProductRelated } from "@/types/product";

/**
 * `/products/{slug}/related/` — ProductRelatedSerializer returns fewer fields than
 * ProductListItem (no stock/is_in_stock), so instead of ProductCard a separate,
 * simpler card is used (no add-to-cart button — stock status is unknown).
 */
export function RelatedProducts({ products }: { products: ProductRelated[] }) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest transition-shadow hover:shadow-lg"
        >
          <div className="aspect-square overflow-hidden">
            <AppImage
              src={getImageUrl(product.image)}
              alt={product.name}
              className="h-full w-full transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
            <span className="label-sm truncate text-on-surface-variant">{product.category_name}</span>
            <span className="label-md line-clamp-2-custom text-on-surface">{product.name}</span>
            {Number(product.rating) > 0 && (
              <span className="flex items-center gap-1 label-sm text-on-surface-variant">
                <Icon name="star" className="icon-fill text-[14px] text-secondary" />
                {product.rating}
              </span>
            )}
            <span className="title-lg mt-auto truncate text-primary">{formatPrice(product.price)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
