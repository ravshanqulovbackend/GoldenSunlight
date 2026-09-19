"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { getPasswordStrength } from "@/lib/utils/passwordStrength";

export function PasswordStrengthMeter({ password }: { password: string }) {
  const t = useTranslations("PasswordStrength");
  if (!password) return null;
  const strength = getPasswordStrength(password, t);

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={cn("h-full rounded-full transition-all duration-200", strength.tone)}
          style={{ width: `${strength.percent}%` }}
        />
      </div>
      <span className="label-sm shrink-0 normal-case text-on-surface-variant">{strength.label}</span>
    </div>
  );
}
