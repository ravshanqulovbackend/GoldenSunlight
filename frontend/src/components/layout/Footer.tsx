import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const SOCIAL_ICONS = ["facebook", "photo_camera", "chat"];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-fixed">
      <div className="mx-auto max-w-container-max-width px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="headline-md uppercase tracking-wide text-primary-fixed">GoldenSunlight</span>
            <p className="body-md text-primary-fixed-dim">
              Cleanliness, trust, and quality for every home.
            </p>
            <div className="flex gap-3">
              {SOCIAL_ICONS.map((icon) => (
                <span
                  key={icon}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-fixed-dim/40"
                >
                  <Icon name={icon} className="text-[18px] text-primary-fixed" />
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label-sm uppercase text-primary-fixed-dim">Sections</span>
            <Link href="/products" className="body-md text-primary-fixed hover:underline">
              Products
            </Link>
            <Link href="/about" className="body-md text-primary-fixed hover:underline">
              About Us
            </Link>
            <Link href="/news" className="body-md text-primary-fixed hover:underline">
              News
            </Link>
            <Link href="/gallery" className="body-md text-primary-fixed hover:underline">
              Gallery
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label-sm uppercase text-primary-fixed-dim">Information</span>
            <Link href="/orders" className="body-md text-primary-fixed hover:underline">
              My Orders
            </Link>
            <Link href="/profile" className="body-md text-primary-fixed hover:underline">
              Profile
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label-sm uppercase text-primary-fixed-dim">Contact</span>
            <span className="flex items-center gap-2 body-md text-primary-fixed">
              <Icon name="location_on" className="text-[18px]" /> Tashkent, Uzbekistan
            </span>
            <span className="flex items-center gap-2 body-md text-primary-fixed">
              <Icon name="call" className="text-[18px]" /> +998 90 123 45 67
            </span>
            <span className="flex items-center gap-2 body-md text-primary-fixed">
              <Icon name="mail" className="text-[18px]" /> info@goldensunlight.uz
            </span>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-primary-fixed-dim/30 pt-6 label-sm normal-case text-primary-fixed-dim md:flex-row">
          <span>&copy; {new Date().getFullYear()} GoldenSunlight. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/certificates" className="hover:underline">
              Certificates
            </Link>
            <Link href="/contact" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
