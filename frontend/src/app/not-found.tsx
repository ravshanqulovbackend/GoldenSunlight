import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/Icon";
import { buttonVariants } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-margin-mobile py-24 text-center">
      <Icon name="search_off" className="text-[64px] text-outline" />
      <h1 className="headline-md text-on-surface">{t("title")}</h1>
      <p className="body-md max-w-sm text-on-surface-variant">{t("description")}</p>
      <Link href="/" className={buttonVariants("primary", "md", "mt-2")}>
        {t("backToHome")}
      </Link>
    </main>
  );
}
