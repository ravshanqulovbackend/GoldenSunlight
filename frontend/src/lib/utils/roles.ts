"use client";

import { useTranslations } from "next-intl";
import type { UserRole } from "@/types/auth";

/** Locale-aware replacement for the static `ROLE_LABELS` map — use inside client components. */
export function useRoleLabels(): Record<UserRole, string> {
  const t = useTranslations("Roles");
  return { staff: t("staff"), admin: t("admin"), superadmin: t("superadmin") };
}
