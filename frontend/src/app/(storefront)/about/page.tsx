import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { getCompany } from "@/lib/api/endpoints/company";
import { getCertificates } from "@/lib/api/endpoints/certificates";
import { getGalleryImages } from "@/lib/api/endpoints/gallery";
import { AppImage } from "@/components/ui/AppImage";
import { Icon } from "@/components/ui/Icon";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Reveal } from "@/components/ui/Reveal";
import { getImageUrl } from "@/lib/utils/image";
import { pickLocalized } from "@/lib/utils/i18n";
import { PartnershipForm } from "@/components/about/PartnershipForm";
import type { Locale } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const [company, locale, tCommon] = await Promise.all([
    getCompany().catch(() => null),
    getLocale(),
    getTranslations("Common"),
  ]);
  const name = company ? pickLocalized(company.name, company.name, locale as Locale) : undefined;
  const tagline = company ? pickLocalized(company.tagline, company.tagline_ar, locale as Locale) : undefined;
  const description = company ? pickLocalized(company.description, company.description_ar, locale as Locale) : undefined;
  const aboutUs = tCommon("aboutUs");
  return {
    title: name ? `${aboutUs} — ${name}` : aboutUs,
    description: tagline || description?.slice(0, 160),
  };
}

export default async function AboutPage() {
  const [company, certificates, galleryImages, t, locale] = await Promise.all([
    getCompany().catch(() => null),
    getCertificates().catch(() => []),
    getGalleryImages().catch(() => []),
    getTranslations("About"),
    getLocale(),
  ]);
  const loc = locale as Locale;

  const tagline = company ? pickLocalized(company.tagline, company.tagline_ar, loc) : "";
  const description = company ? pickLocalized(company.description, company.description_ar, loc) : "";
  const mission = company ? pickLocalized(company.mission, company.mission_ar, loc) : "";
  const vision = company ? pickLocalized(company.vision, company.vision_ar, loc) : "";

  const PRODUCTION_HIGHLIGHTS = [
    { icon: "precision_manufacturing", title: t("highlights.equipmentTitle"), description: t("highlights.equipmentDescription") },
    { icon: "verified_user", title: t("highlights.qualityTitle"), description: t("highlights.qualityDescription") },
    { icon: "eco", title: t("highlights.ecoTitle"), description: t("highlights.ecoDescription") },
  ];

  const stats = company
    ? [
        { value: company.experience_years, label: t("stats.yearsOfExperience") },
        { value: company.product_types, label: t("stats.productTypes") },
        { value: company.partner_stores, label: t("stats.partnerStores") },
        { value: company.export_countries, label: t("stats.exportCountries") },
      ].filter((stat) => stat.value)
    : [];

  const featuredGallery = galleryImages.filter((img) => img.is_featured).slice(0, 8);
  const galleryToShow = featuredGallery.length > 0 ? featuredGallery : galleryImages.slice(0, 8);

  return (
    <>
      <section className="relative flex min-h-[420px] items-center overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary py-20">
        <span aria-hidden className="gs-aurora animate-float -start-20 top-[-5rem] h-72 w-72 bg-secondary-fixed-dim" />
        <span aria-hidden className="gs-aurora animate-float-slow -end-20 bottom-[-7rem] h-96 w-96 bg-tertiary-fixed-dim" />

        <div className="relative z-10 mx-auto w-full max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl">
            <p className="label-md mb-4 animate-fade-side uppercase tracking-widest text-primary-fixed-dim">
              {company?.name || "GoldenSunlight"}
            </p>
            <AnimatedText
              as="h1"
              text={tagline || t("defaultTagline")}
              delay={0.12}
              className="headline-lg-mobile md:display-lg text-primary-fixed"
            />
            {description && (
              <AnimatedText
                as="p"
                text={description}
                delay={0.42}
                step={0.018}
                className="body-lg mt-6 text-primary-fixed-dim"
              />
            )}
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="mx-auto -mt-8 max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-container-lowest p-8 shadow-xl lg:grid-cols-4">
            {stats.map((stat, index) => (
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
      )}

      {(mission || vision) && (
        <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {mission && (
              <Reveal variant="side" className="h-full">
                <div className="gs-lift group/card h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-8 hover:border-primary/40 hover:shadow-xl">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform duration-400 ease-spring group-hover/card:scale-110 group-hover/card:rotate-6">
                    <Icon name="flag" className="text-[24px]" />
                  </span>
                  <h2 className="title-lg mt-4 text-on-surface">{t("ourMission")}</h2>
                  <p className="body-md mt-2 text-on-surface-variant">{mission}</p>
                </div>
              </Reveal>
            )}
            {vision && (
              <Reveal variant="side" delay={0.12} className="h-full">
                <div className="gs-lift group/card h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-8 hover:border-secondary/50 hover:shadow-xl">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container transition-transform duration-400 ease-spring group-hover/card:scale-110 group-hover/card:rotate-6">
                    <Icon name="visibility" className="text-[24px]" />
                  </span>
                  <h2 className="title-lg mt-4 text-on-surface">{t("ourVision")}</h2>
                  <p className="body-md mt-2 text-on-surface-variant">{vision}</p>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {description && (
        <section className="bg-surface-container-low py-section-gap">
          <div className="mx-auto grid max-w-container-max-width grid-cols-1 items-center gap-10 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
            <Reveal variant="side" className="aspect-[4/3] overflow-hidden rounded-lg bg-surface-container-high">
              {company?.logo ? (
                <AppImage
                  src={getImageUrl(company.logo)}
                  alt={company.name}
                  className="h-full w-full transition-transform duration-700 ease-soft hover:scale-105"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Icon name="factory" className="text-[64px] text-outline" />
                </span>
              )}
            </Reveal>
            <Reveal delay={0.12}>
              <h2 className="headline-md text-on-surface">{t("ourHistory")}</h2>
              <p className="body-md mt-4 text-on-surface-variant">{description}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {company?.founded_year && (
                  <div>
                    <dt className="label-sm text-on-surface-variant">{t("founded")}</dt>
                    <dd className="title-lg text-on-surface">{company.founded_year}</dd>
                  </div>
                )}
                {company?.employee_count && (
                  <div>
                    <dt className="label-sm text-on-surface-variant">{t("employees")}</dt>
                    <dd className="title-lg text-on-surface">{company.employee_count}</dd>
                  </div>
                )}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      <section className="bg-primary py-section-gap text-primary-fixed">
        <div className="mx-auto max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <Reveal>
            <h2 className="headline-md text-center text-primary-fixed">{t("productionProcess")}</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {PRODUCTION_HIGHLIGHTS.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 0.12}
                className="group/hl flex flex-col items-center gap-3 text-center"
              >
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed/10 transition-[background-color,scale] duration-400 ease-spring group-hover/hl:scale-110 group-hover/hl:bg-primary-fixed/20">
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
        <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
          <h2 className="headline-md text-center text-on-surface">{t("ourCertificates")}</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {certificates.map((cert, index) => {
              const certTitle = pickLocalized(cert.title, cert.title_ar, loc);
              const certIssuedBy = pickLocalized(cert.issued_by, cert.issued_by_ar, loc);
              return (
                <Reveal key={cert.id} variant="zoom" delay={(index % 4) * 0.08} className="h-full">
                  <div className="gs-lift group/cert flex h-full flex-col items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center hover:border-primary/40 hover:shadow-xl">
                    <div className="h-24 w-24 overflow-hidden rounded-lg bg-surface-container-high">
                      <AppImage
                        src={getImageUrl(cert.image)}
                        alt={certTitle}
                        className="h-full w-full transition-transform duration-500 ease-soft group-hover/cert:scale-110"
                      />
                    </div>
                    <span className="label-md text-on-surface">{certTitle}</span>
                    {certIssuedBy && <span className="label-sm text-on-surface-variant">{certIssuedBy}</span>}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {galleryToShow.length > 0 && (
        <section className="bg-surface-container-low py-section-gap">
          <div className="mx-auto max-w-container-max-width px-margin-mobile md:px-margin-desktop">
            <h2 className="headline-md text-center text-on-surface">{t("scenesFromProduction")}</h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {galleryToShow.map((image, index) => (
                <Reveal key={image.id} variant="zoom" delay={(index % 4) * 0.07}>
                  <div className="aspect-square overflow-hidden rounded-lg bg-surface-container-high">
                    <AppImage
                      src={getImageUrl(image.image)}
                      alt={image.title}
                      className="h-full w-full transition-transform duration-500 ease-soft hover:scale-110"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-10 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="headline-md text-on-surface">{t("partnerWithUs")}</h2>
            <p className="body-md mt-3 text-on-surface-variant">{t("partnerIntro")}</p>
            {company && (company.phone || company.email || company.address) && (
              <div className="mt-6 flex flex-col gap-3">
                {company.phone && (
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Icon name="call" className="text-[20px] text-primary" />
                    <span className="body-md" dir="ltr">{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Icon name="mail" className="text-[20px] text-primary" />
                    <span className="body-md" dir="ltr">{company.email}</span>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Icon name="location_on" className="text-[20px] text-primary" />
                    <span className="body-md">{company.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <PartnershipForm />
        </div>
      </section>
    </>
  );
}
