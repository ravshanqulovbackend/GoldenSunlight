import type { Metadata } from "next";
import { getCompany } from "@/lib/api/endpoints/company";
import { getCertificates } from "@/lib/api/endpoints/certificates";
import { getGalleryImages } from "@/lib/api/endpoints/gallery";
import { AppImage } from "@/components/ui/AppImage";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/utils/image";
import { PartnershipForm } from "@/components/about/PartnershipForm";

const PRODUCTION_HIGHLIGHTS = [
  { icon: "precision_manufacturing", title: "Modern Equipment", description: "Production lines built to European standards." },
  { icon: "verified_user", title: "Quality Control", description: "Every batch goes through laboratory testing." },
  { icon: "eco", title: "Eco-Friendly", description: "Only natural, certified raw materials." },
];

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany().catch(() => null);
  return {
    title: company ? `About Us — ${company.name}` : "About Us",
    description: company?.tagline || company?.description?.slice(0, 160),
  };
}

export default async function AboutPage() {
  const [company, certificates, galleryImages] = await Promise.all([
    getCompany().catch(() => null),
    getCertificates().catch(() => []),
    getGalleryImages().catch(() => []),
  ]);

  const stats = company
    ? [
        { value: company.experience_years, label: "Years of Experience" },
        { value: company.product_types, label: "Product Types" },
        { value: company.partner_stores, label: "Partner Stores" },
        { value: company.export_countries, label: "Export Countries" },
      ].filter((stat) => stat.value)
    : [];

  const featuredGallery = galleryImages.filter((img) => img.is_featured).slice(0, 8);
  const galleryToShow = featuredGallery.length > 0 ? featuredGallery : galleryImages.slice(0, 8);

  return (
    <>
      <section className="relative flex min-h-[420px] items-center overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary py-20">
        <div className="relative z-10 mx-auto w-full max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl">
            <p className="label-md mb-4 uppercase tracking-widest text-primary-fixed-dim">
              {company?.name || "GoldenSunlight"}
            </p>
            <h1 className="headline-lg-mobile md:display-lg text-primary-fixed">
              {company?.tagline || "Cleanliness and care by your side every day"}
            </h1>
            {company?.description && (
              <p className="body-lg mt-6 text-primary-fixed-dim">{company.description}</p>
            )}
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="mx-auto -mt-8 max-w-container-max-width px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-container-lowest p-8 shadow-xl lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 border-outline-variant p-4 text-center first:border-0 lg:border-l">
                <span className="display-lg text-[2.5rem] text-primary">{stat.value}</span>
                <span className="label-sm text-on-surface-variant">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(company?.mission || company?.vision) && (
        <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {company?.mission && (
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                  <Icon name="flag" className="text-[24px]" />
                </span>
                <h2 className="title-lg mt-4 text-on-surface">Our Mission</h2>
                <p className="body-md mt-2 text-on-surface-variant">{company.mission}</p>
              </div>
            )}
            {company?.vision && (
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <Icon name="visibility" className="text-[24px]" />
                </span>
                <h2 className="title-lg mt-4 text-on-surface">Our Vision</h2>
                <p className="body-md mt-2 text-on-surface-variant">{company.vision}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {company?.description && (
        <section className="bg-surface-container-low py-section-gap">
          <div className="mx-auto grid max-w-container-max-width grid-cols-1 items-center gap-10 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-surface-container-high">
              {company.logo ? (
                <AppImage src={getImageUrl(company.logo)} alt={company.name} className="h-full w-full" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Icon name="factory" className="text-[64px] text-outline" />
                </span>
              )}
            </div>
            <div>
              <h2 className="headline-md text-on-surface">Our History</h2>
              <p className="body-md mt-4 text-on-surface-variant">{company.description}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {company.founded_year && (
                  <div>
                    <dt className="label-sm text-on-surface-variant">Founded</dt>
                    <dd className="title-lg text-on-surface">{company.founded_year}</dd>
                  </div>
                )}
                {company.employee_count && (
                  <div>
                    <dt className="label-sm text-on-surface-variant">Employees</dt>
                    <dd className="title-lg text-on-surface">{company.employee_count}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
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
        <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
          <h2 className="headline-md text-center text-on-surface">Our Certificates</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex flex-col items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center">
                <div className="h-24 w-24 overflow-hidden rounded-lg bg-surface-container-high">
                  <AppImage src={getImageUrl(cert.image)} alt={cert.title} className="h-full w-full" />
                </div>
                <span className="label-md text-on-surface">{cert.title}</span>
                {cert.issued_by && <span className="label-sm text-on-surface-variant">{cert.issued_by}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {galleryToShow.length > 0 && (
        <section className="bg-surface-container-low py-section-gap">
          <div className="mx-auto max-w-container-max-width px-margin-mobile md:px-margin-desktop">
            <h2 className="headline-md text-center text-on-surface">Scenes from Production</h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {galleryToShow.map((image) => (
                <div key={image.id} className="aspect-square overflow-hidden rounded-lg bg-surface-container-high">
                  <AppImage
                    src={getImageUrl(image.image)}
                    alt={image.title}
                    className="h-full w-full transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-10 rounded-lg border border-outline-variant bg-surface-container-lowest p-8 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="headline-md text-on-surface">Partner With Us</h2>
            <p className="body-md mt-3 text-on-surface-variant">
              If you&apos;re interested in partnership terms for your store or company, leave a
              request via the form below — our specialists will get in touch soon.
            </p>
            {company && (company.phone || company.email || company.address) && (
              <div className="mt-6 flex flex-col gap-3">
                {company.phone && (
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Icon name="call" className="text-[20px] text-primary" />
                    <span className="body-md">{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Icon name="mail" className="text-[20px] text-primary" />
                    <span className="body-md">{company.email}</span>
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
