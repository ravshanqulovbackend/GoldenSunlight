import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/api/endpoints/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const STATIC_ROUTES = ["", "/products", "/about", "/contact", "/auth/login", "/auth/register"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  try {
    const products = await getProducts({ page: 1 });
    const productEntries: MetadataRoute.Sitemap = products.results.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: new Date(),
    }));
    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
