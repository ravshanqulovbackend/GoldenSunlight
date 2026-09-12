"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default function ProfilePasswordPage() {
  const t = useTranslations("ChangePassword");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: tCommon("home"), href: "/" }, { label: t("title") }]} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="headline-md text-on-surface">{t("title")}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <Icon name="arrow_back" className="text-[18px]" mirrorInRtl />
          {t("back")}
        </Button>
      </div>

      <Card className="mt-8 flex max-w-lg flex-col gap-4 p-6">
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
