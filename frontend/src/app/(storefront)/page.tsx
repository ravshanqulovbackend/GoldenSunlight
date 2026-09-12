import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { getPopularProducts } from "@/lib/api/endpoints/products";
import { getCategories } from "@/lib/api/endpoints/categories";
import { getCompany } from "@/lib/api/endpoints/company";
import { getCertificates } from "@/lib/api/endpoints/certificates";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";
import { buttonVariants } from "@/components/ui/Button";
import { getImageUrl } from "@/lib/utils/image";
import { pickLocalized } from "@/lib/utils/i18n";
import type { Company } from "@/types/company";
import type { Locale } from "@/i18n/config";

const FALLBACK_STATS: Pick<Company, "experience_years" | "product_types" | "partner_stores" | "export_countries"> = {
  experience_years: "25+",
  product_types: "100+",
  partner_stores: "100+",
  export_countries: "10+",
};

export default async function HomePage() {
  const [popularProducts, categories, companyStats, certificates, t, tAbout, locale] = await Promise.all([
    getPopularProducts().catch(() => []),
    getCategories().catch(() => []),
    getCompany().catch(() => FALLBACK_STATS),
    getCertificates().catch(() => []),
    getTranslations("Home"),
    getTranslations("About"),
    getLocale(),
  ]);
  const loc = locale as Locale;

  const STATS = [
    { value: companyStats.experience_years, label: tAbout("stats.yearsOfExperience") },
    { value: companyStats.product_types, label: tAbout("stats.productTypes") },
    { value: companyStats.partner_stores, label: tAbout("stats.partnerStores") },
    { value: companyStats.export_countries, label: tAbout("stats.exportCountries") },
  ];

  const PRODUCTION_HIGHLIGHTS = [
    { icon: "precision_manufacturing", title: tAbout("highlights.equipmentTitle"), description: tAbout("highlights.equipmentDescription") },
    { icon: "verified_user", title: tAbout("highlights.qualityTitle"), description: tAbout("highlights.qualityDescription") },
    { icon: "eco", title: tAbout("highlights.ecoTitle"), description: tAbout("highlights.ecoDescription") },
  ];

  return (
    <>
      <section className="relative flex min-h-[460px] items-center overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary py-20">
        <div className="relative z-10 mx-auto w-full max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl">
            <p className="label-md mb-4 uppercase tracking-widest text-primary-fixed-dim">GoldenSunlight</p>
            <h1 className="headline-lg-mobile md:display-lg text-primary-fixed">
              {t("heroTitle")}
            </h1>
            <p className="body-lg mt-6 text-primary-fixed-dim">
              {t("heroDescription")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className={buttonVariants("primary", "lg", "bg-primary-fixed text-on-primary-fixed hover:brightness-105")}>
                {t("viewProducts")}
              </Link>
              <Link href="/about" className={buttonVariants("outline", "lg", "border-primary-fixed-dim text-primary-fixed hover:bg-primary-fixed/10")}>
                {t("aboutUsLink")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 mb-8 max-w-container-max-width px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-container-lowest p-8 shadow-xl lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 border-outline-variant p-4 text-center first:border-0 lg:border-s">
              <span className="display-lg text-[2.5rem] text-primary">{stat.value}</span>
              <span className="label-sm text-on-surface-variant">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-surface-container-low py-section-gap">
          <div className="mx-auto max-w-container-max-width px-margin-mobile text-center md:px-margin-desktop">
            <h2 className="headline-md text-on-surface">{t("productCategories")}</h2>
            <p className="body-md mx-auto mt-3 max-w-xl text-on-surface-variant">
              {t("categoriesIntro")}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => {
                const categoryName = pickLocalized(category.name, category.name_ar, loc);
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {category.image ? (
                      <span className="h-14 w-14 overflow-hidden rounded-full transition-transform group-hover:scale-110">
                        <AppImage src={getImageUrl(category.image)} alt={categoryName} className="h-full w-full" />
                      </span>
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform group-hover:scale-110">
                        <Icon name="soap" className="text-[28px]" />
                      </span>
                    )}
                    <span className="title-lg text-on-surface">{categoryName}</span>
                    <span className="label-sm text-on-surface-variant">{t("categoryProductsCount", { count: category.product_count })}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {popularProducts.length > 0 && (
        <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="headline-md text-on-surface">{t("popularProducts")}</h2>
              <p className="body-md mt-2 text-on-surface-variant">{t("popularProductsIntro")}</p>
            </div>
            <Link href="/products" className="label-md hidden text-primary hover:underline md:block">
              {t("viewAll")}
            </Link>
          </div>
          <ProductGrid products={popularProducts.slice(0, 6)} />
        </section>
      )}

      <section className="bg-primary py-section-gap text-primary-fixed">
        <div className="mx-auto max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <h2 className="headline-md text-center text-primary-fixed">{tAbout("productionProcess")}</h2>
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
