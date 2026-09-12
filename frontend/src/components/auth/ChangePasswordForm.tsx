"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { changePassword } from "@/lib/api/endpoints/auth";
import { parseApiError, apiErrorFieldEntries } from "@/lib/api/parseApiError";
import { toast } from "@/lib/stores/toastStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/utils/validators";

type Strength = { label: string; percent: number; tone: string };

function getStrength(value: string, t: (key: string) => string): Strength {
  if (!value) return { label: "", percent: 0, tone: "bg-outline-variant" };
  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (value.length < 6) return { label: t("strengthTooShort"), percent: 15, tone: "bg-error" };
  if (score <= 2) return { label: t("strengthWeak"), percent: 40, tone: "bg-error" };
  if (score <= 3) return { label: t("strengthMedium"), percent: 65, tone: "bg-secondary" };
  return { label: t("strengthStrong"), percent: 100, tone: "bg-primary" };
}

export function ChangePasswordForm() {
  const t = useTranslations("ChangePassword");
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });

  const newPassword = watch("new_password") || "";
  const strength = getStrength(newPassword, t);

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword({ old_password: values.old_password, new_password: values.new_password }),
    onSuccess: () => {
      toast(t("updated"), "success");
      reset({ old_password: "", new_password: "", confirm_password: "" });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      const fieldEntries = apiErrorFieldEntries(apiError.body);
      // The backend returns errors like "Current password is incorrect" as {old_password:[...]} —
      // we surface that under the correct field instead of hiding it in a generic toast.
      const known = fieldEntries.filter(([field]) => field === "old_password" || field === "new_password");
      if (known.length > 0) {
        for (const [field, message] of known) {
          setError(field as "old_password" | "new_password", { message });
        }
      } else {
        toast(apiError.message || t("updateError"), "error");
      }
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
      <p className="body-md text-on-surface-variant">{t("hint")}</p>

      <Input
        label={t("currentPassword")}
        type="password"
        autoComplete="current-password"
        error={errors.old_password?.message}
        {...register("old_password")}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          label={t("newPassword")}
          type="password"
          autoComplete="new-password"
          error={errors.new_password?.message}
          {...register("new_password")}
        />
        {newPassword.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className={cn("h-full rounded-full transition-all duration-200", strength.tone)}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
            <span className="label-sm shrink-0 normal-case text-on-surface-variant">{strength.label}</span>
          </div>
        )}
      </div>

      <Input
        label={t("confirmNewPassword")}
        type="password"
        autoComplete="new-password"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />

      <Button type="submit" disabled={mutation.isPending} className="w-fit">
        <Icon name="lock_reset" className="text-[18px]" />
        {mutation.isPending ? t("updating") : t("updatePassword")}
      </Button>
    </form>
  );
}
