import Link from "next/link";
import { getPopularProducts } from "@/lib/api/endpoints/products";
import { getCategories } from "@/lib/api/endpoints/categories";
import { getCompany } from "@/lib/api/endpoints/company";
import { getCertificates } from "@/lib/api/endpoints/certificates";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";
import { buttonVariants } from "@/components/ui/Button";
import { getImageUrl } from "@/lib/utils/image";
import type { Company } from "@/types/company";

const FALLBACK_STATS: Pick<Company, "experience_years" | "product_types" | "partner_stores" | "export_countries"> = {
  experience_years: "25+",
  product_types: "100+",
  partner_stores: "100+",
  export_countries: "10+",
};

const PRODUCTION_HIGHLIGHTS = [
  { icon: "precision_manufacturing", title: "Modern Equipment", description: "Production lines built to European standards." },
  { icon: "verified_user", title: "Quality Control", description: "Every batch goes through laboratory testing." },
  { icon: "eco", title: "Eco-Friendly", description: "Only natural, certified raw materials." },
];

export default async function HomePage() {
  const [popularProducts, categories, companyStats, certificates] = await Promise.all([
    getPopularProducts().catch(() => []),
    getCategories().catch(() => []),
    getCompany().catch(() => FALLBACK_STATS),
    getCertificates().catch(() => []),
  ]);

  const STATS = [
    { value: companyStats.experience_years, label: "Years of Experience" },
    { value: companyStats.product_types, label: "Product Types" },
    { value: companyStats.partner_stores, label: "Partner Stores" },
    { value: companyStats.export_countries, label: "Export Countries" },
  ];

  return (
    <>
      <section className="relative flex min-h-[460px] items-center overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary py-20">
        <div className="relative z-10 mx-auto w-full max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl">
            <p className="label-md mb-4 uppercase tracking-widest text-primary-fixed-dim">GoldenSunlight</p>
            <h1 className="headline-lg-mobile md:display-lg text-primary-fixed">
              Cleanliness and care by your side every day
            </h1>
            <p className="body-lg mt-6 text-primary-fixed-dim">
              Dubai&apos;s leading manufacturer of hygiene and household cleaning products —
              wet wipes, feminine hygiene, baby products and cleaning supplies all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className={buttonVariants("primary", "lg", "bg-primary-fixed text-on-primary-fixed hover:brightness-105")}>
                View Products
              </Link>
              <Link href="/about" className={buttonVariants("outline", "lg", "border-primary-fixed-dim text-primary-fixed hover:bg-primary-fixed/10")}>
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 mb-8 max-w-container-max-width px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-container-lowest p-8 shadow-xl lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 border-outline-variant p-4 text-center first:border-0 lg:border-l">
              <span className="display-lg text-[2.5rem] text-primary">{stat.value}</span>
              <span className="label-sm text-on-surface-variant">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-surface-container-low py-section-gap">
          <div className="mx-auto max-w-container-max-width px-margin-mobile text-center md:px-margin-desktop">
            <h2 className="headline-md text-on-surface">Product Categories</h2>
            <p className="body-md mx-auto mt-3 max-w-xl text-on-surface-variant">
              Find the highest-quality hygiene and cleaning products in every category.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {category.image ? (
                    <span className="h-14 w-14 overflow-hidden rounded-full transition-transform group-hover:scale-110">
                      <AppImage src={getImageUrl(category.image)} alt={category.name} className="h-full w-full" />
                    </span>
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform group-hover:scale-110">
                      <Icon name="soap" className="text-[28px]" />
                    </span>
                  )}
                  <span className="title-lg text-on-surface">{category.name}</span>
                  <span className="label-sm text-on-surface-variant">{category.product_count} products</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {popularProducts.length > 0 && (
        <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="headline-md text-on-surface">Popular Products</h2>
              <p className="body-md mt-2 text-on-surface-variant">The products our customers choose most.</p>
            </div>
            <Link href="/products" className="label-md hidden text-primary hover:underline md:block">
              View All
            </Link>
          </div>
          <ProductGrid products={popularProducts.slice(0, 6)} />
        </section>
      )}

      <section className="bg-primary py-section-gap text-primary-fixed">
        <div className="mx-auto max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <h2 className="headline-md text-center text-primary-fixed">Production Process</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {PRODUCTION_HIGHLIGHTS.map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed/10">
                  <Icon name={item.icon} className="text-[32px] text-primary-fixed" />
                </span>
                <h3 className="title-lg text-primary-fixed">{item.title}</h3>
                <p className="body-md text-primary-fixed-dim">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {certificates.length > 0 && (
        <section className="bg-surface-container-lowest py-16">
          <div className="mx-auto flex max-w-container-max-width flex-wrap items-center justify-center gap-10 px-margin-mobile grayscale transition-all hover:grayscale-0 md:px-margin-desktop">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-2 text-on-surface-variant">
                <Icon name="verified" className="text-[24px] text-secondary" />
                <span className="label-md">{cert.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
