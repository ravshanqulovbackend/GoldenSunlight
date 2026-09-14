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
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";
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
        {/* Gradient ustida sekin suzuvchi yorug'lik dog'lari — hero "tirik" ko'rinadi */}
        <span aria-hidden className="gs-aurora animate-float -start-24 top-[-6rem] h-80 w-80 bg-secondary-fixed-dim" />
        <span aria-hidden className="gs-aurora animate-float-slow -end-16 bottom-[-8rem] h-96 w-96 bg-tertiary-fixed-dim" />

        <div className="relative z-10 mx-auto w-full max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl">
            <p className="label-md mb-4 animate-fade-side uppercase tracking-widest text-primary-fixed-dim">
              GoldenSunlight
            </p>
            {/* Sarlavha so'zma-so'z ko'tariladi, tavsif esa undan keyin */}
            <AnimatedText
              as="h1"
              text={t("heroTitle")}
              delay={0.12}
              className="headline-lg-mobile md:display-lg text-primary-fixed"
            />
            <AnimatedText
              as="p"
              text={t("heroDescription")}
              delay={0.42}
              step={0.022}
              className="body-lg mt-6 text-primary-fixed-dim"
            />
            <div className="mt-8 flex flex-wrap gap-4 animate-fade-up [animation-delay:0.7s]">
              <Link href="/products" className={buttonVariants("primary", "lg", "bg-primary-fixed text-on-primary-fixed hover:brightness-105 hover:shadow-primary-fixed/30")}>
                {t("viewProducts")}
              </Link>
              <Link href="/about" className={buttonVariants("outline", "lg", "border-primary-fixed-dim text-primary-fixed hover:border-primary-fixed hover:bg-primary-fixed/10 hover:text-primary-fixed")}>
                {t("aboutUsLink")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 mb-8 max-w-container-max-width px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-container-lowest p-8 shadow-xl lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <Reveal
              key={stat.label}
              variant="zoom"
              delay={index * 0.08}
              className="flex flex-col items-center gap-1 border-outline-variant p-4 text-center first:border-0 lg:border-s"
            >
              <span className="display-lg text-[2.5rem] text-primary">{stat.value}</span>
              <span className="label-sm text-on-surface-variant">{stat.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-surface-container-low py-section-gap">
          <div className="mx-auto max-w-container-max-width px-margin-mobile text-center md:px-margin-desktop">
            <Reveal>
              <h2 className="headline-md text-on-surface">{t("productCategories")}</h2>
              <p className="body-md mx-auto mt-3 max-w-xl text-on-surface-variant">
                {t("categoriesIntro")}
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {categories.slice(0, 8).map((category, index) => {
                const categoryName = pickLocalized(category.name, category.name_ar, loc);
                return (
                  <Reveal key={category.id} variant="zoom" delay={(index % 4) * 0.07}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="gs-lift group flex h-full flex-col items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 hover:border-primary/40 hover:shadow-xl"
                    >
                    {category.image ? (
                      <span className="h-14 w-14 overflow-hidden rounded-full transition-transform duration-400 ease-spring group-hover:scale-115 group-hover:rotate-6">
                        <AppImage src={getImageUrl(category.image)} alt={categoryName} className="h-full w-full" />
                      </span>
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform duration-400 ease-spring group-hover:scale-115 group-hover:rotate-6">
                        <Icon name="soap" className="text-[28px]" />
                      </span>
                    )}
                    <span className="title-lg text-on-surface transition-colors duration-200 group-hover:text-primary">
                      {categoryName}
                    </span>
                    <span className="label-sm text-on-surface-variant">{t("categoryProductsCount", { count: category.product_count })}</span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {popularProducts.length > 0 && (
        <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
          <Reveal className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="headline-md text-on-surface">{t("popularProducts")}</h2>
              <p className="body-md mt-2 text-on-surface-variant">{t("popularProductsIntro")}</p>
            </div>
            <Link
              href="/products"
              className="group/all label-md hidden items-center gap-1 text-primary md:inline-flex"
            >
              {t("viewAll")}
              <Icon
                name="arrow_forward"
                className="text-[18px] transition-transform duration-300 ease-spring group-hover/all:translate-x-1 rtl:rotate-180 rtl:group-hover/all:-translate-x-1"
              />
            </Link>
          </Reveal>
          <ProductGrid products={popularProducts.slice(0, 6)} />
        </section>
      )}

      <section className="bg-primary py-section-gap text-primary-fixed">
        <div className="mx-auto max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <Reveal>
            <h2 className="headline-md text-center text-primary-fixed">{tAbout("productionProcess")}</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {PRODUCTION_HIGHLIGHTS.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 0.12}
                className="group/hl flex flex-col items-center gap-3 text-center"
              >
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed/10 transition-[background-color,scale] duration-400 ease-spring group-hover/hl:scale-110 group-hover/hl:bg-primary-fixed/20">
                  {/* Ikonka atrofida tarqaluvchi halqa */}
                  <span aria-hidden className="absolute inset-0 animate-ring rounded-full border border-primary-fixed/40" />
                  <Icon name={item.icon} className="text-[32px] text-primary-fixed" />
                </span>
                <h3 className="title-lg text-primary-fixed">{item.title}</h3>
                <p className="body-md text-primary-fixed-dim">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {certificates.length > 0 && (
        <section className="bg-surface-container-lowest py-16">
          <div className="mx-auto flex max-w-container-max-width flex-wrap items-center justify-center gap-10 px-margin-mobile grayscale transition-[filter] duration-500 ease-soft hover:grayscale-0 md:px-margin-desktop">
            {certificates.map((cert, index) => (
              <Reveal
                key={cert.id}
                variant="side"
                delay={index * 0.06}
                className="group/cert flex items-center gap-2 text-on-surface-variant"
              >
                <Icon
                  name="verified"
                  className="text-[24px] text-secondary transition-transform duration-400 ease-spring group-hover/cert:scale-125 group-hover/cert:rotate-12"
                />
                <span className="label-md">{cert.title}</span>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
