import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-margin-mobile py-24 text-center">
      <Icon name="search_off" className="text-[64px] text-outline" />
      <h1 className="headline-md text-on-surface">Page not found</h1>
      <p className="body-md max-w-sm text-on-surface-variant">
        The page you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/" className={buttonVariants("primary", "md", "mt-2")}>
        Back to Home
      </Link>
    </main>
  );
}
