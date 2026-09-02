import { MEDIA_ORIGIN } from "@/lib/api/config";

export const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

/**
 * `products` app (Product/ProductImage/Brand) nisbiy yo'l qaytaradi (FlexibleImageField),
 * boshqa barcha app (news/gallery/certificates/pages/users) mutlaq URL qaytaradi.
 * Bu funksiya ikkalasini ham to'g'ri hal qiladi.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${MEDIA_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
