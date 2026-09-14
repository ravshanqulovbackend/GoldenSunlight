"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default function ProfilePasswordPage() {
  const t = useTranslations("ChangePassword");
  const tProfile = useTranslations("Profile");

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 label-md text-on-surface-variant hover:text-primary"
      >
        <Icon name="arrow_back" className="text-[18px]" mirrorInRtl />
        {tProfile("backToProfile")}
      </Link>

      <h1 className="mt-4 headline-md text-on-surface">{t("title")}</h1>
      <p className="mt-2 body-md text-on-surface-variant">{tProfile("changePasswordDescription")}</p>

      <Card className="mt-8 flex max-w-lg flex-col gap-4 p-6 sm:p-8">
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
