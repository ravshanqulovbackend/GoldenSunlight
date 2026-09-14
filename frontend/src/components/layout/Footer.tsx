import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";

const SOCIAL_ICONS = ["thumb_up", "photo_camera", "chat"];

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-primary text-primary-fixed">
      <div className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="gs-stagger grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="headline-md uppercase tracking-wide text-primary-fixed">GoldenSunlight</span>
            <p className="body-md text-primary-fixed-dim">{t("tagline")}</p>
            <div className="flex gap-3">
              {SOCIAL_ICONS.map((icon) => (
                <span
                  key={icon}
                  className="gs-icon-btn flex h-9 w-9 items-center justify-center rounded-full border border-primary-fixed-dim/40 hover:border-primary-fixed hover:bg-primary-fixed/10"
                >
                  <Icon name={icon} className="text-[18px] text-primary-fixed" />
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label-sm uppercase text-primary-fixed-dim">{t("sections")}</span>
            <Link href="/products" className="body-md w-fit text-primary-fixed transition-[translate,color] duration-250 ease-soft hover:translate-x-1 hover:text-secondary-fixed rtl:hover:-translate-x-1">
              {t("products")}
            </Link>
            <Link href="/about" className="body-md w-fit text-primary-fixed transition-[translate,color] duration-250 ease-soft hover:translate-x-1 hover:text-secondary-fixed rtl:hover:-translate-x-1">
              {t("aboutUs")}
            </Link>
            <Link href="/news" className="body-md w-fit text-primary-fixed transition-[translate,color] duration-250 ease-soft hover:translate-x-1 hover:text-secondary-fixed rtl:hover:-translate-x-1">
              {t("news")}
            </Link>
            <Link href="/gallery" className="body-md w-fit text-primary-fixed transition-[translate,color] duration-250 ease-soft hover:translate-x-1 hover:text-secondary-fixed rtl:hover:-translate-x-1">
              {t("gallery")}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label-sm uppercase text-primary-fixed-dim">{t("information")}</span>
            <Link href="/orders" className="body-md w-fit text-primary-fixed transition-[translate,color] duration-250 ease-soft hover:translate-x-1 hover:text-secondary-fixed rtl:hover:-translate-x-1">
              {t("myOrders")}
            </Link>
            <Link href="/profile" className="body-md w-fit text-primary-fixed transition-[translate,color] duration-250 ease-soft hover:translate-x-1 hover:text-secondary-fixed rtl:hover:-translate-x-1">
              {t("profile")}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label-sm uppercase text-primary-fixed-dim">{t("contact")}</span>
            <span className="flex items-center gap-2 body-md text-primary-fixed">
              <Icon name="location_on" className="text-[18px]" /> {t("address")}
            </span>
            <span className="flex items-center gap-2 body-md text-primary-fixed">
              <Icon name="call" className="text-[18px]" /> +971 4 123 4567
            </span>
            <span className="flex items-center gap-2 body-md text-primary-fixed">
              <Icon name="mail" className="text-[18px]" /> info@goldensunlight.ae
            </span>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-primary-fixed-dim/30 pt-6 label-sm normal-case text-primary-fixed-dim md:flex-row">
          <span>&copy; {new Date().getFullYear()} GoldenSunlight. {t("rightsReserved")}</span>
          <div className="flex gap-4">
            <Link href="/certificates" className="transition-colors duration-200 hover:text-primary-fixed">
              {t("certificates")}
            </Link>
            <Link href="/contact" className="transition-colors duration-200 hover:text-primary-fixed">
              {t("privacyPolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
