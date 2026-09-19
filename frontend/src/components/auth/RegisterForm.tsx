"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { register as registerUser } from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { parseApiError, apiErrorFieldEntries } from "@/lib/api/parseApiError";
import { toast } from "@/lib/stores/toastStore";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { registerSchema, type RegisterFormValues } from "@/lib/utils/validators";

const REGISTER_FIELDS = ["username", "email", "phone", "password"] as const;

export function RegisterForm() {
  const t = useTranslations("Auth.register");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register: registerField,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const password = watch("password") || "";

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) => registerUser(values),
    onSuccess: ({ user, tokens }) => {
      setAuth(tokens, user);
      toast(t("welcome", { name: user.first_name || user.username }), "success");
      router.push("/");
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      // Backend username/email/phone/parol uchun {field: [...]} shaklida qaytaradi
      // (masalan "This email is already registered") — buni umumiy toast'da
      // yashirmasdan, aynan shu input ostida ko'rsatamiz (ChangePasswordForm'dagi
      // bilan bir xil naqsh).
      const known = apiErrorFieldEntries(apiError.body).filter(
        (entry): entry is [(typeof REGISTER_FIELDS)[number], string] =>
          (REGISTER_FIELDS as readonly string[]).includes(entry[0])
      );
      if (known.length > 0) {
        for (const [field, message] of known) setError(field, { message });
      } else {
        toast(apiError.message || t("error"), "error");
      }
    },
  });

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="headline-md mb-6 text-center text-on-surface">{t("title")}</h1>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="gs-stagger flex flex-col gap-4">
        <Input label={t("username")} autoComplete="username" autoFocus error={errors.username?.message} {...registerField("username")} />
        <div className="flex flex-col gap-1.5">
          <Input
            label={t("password")}
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...registerField("password")}
          />
          {password.length > 0 && <PasswordStrengthMeter password={password} />}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label={t("firstName")} autoComplete="given-name" error={errors.first_name?.message} {...registerField("first_name")} />
          <Input label={t("lastName")} autoComplete="family-name" error={errors.last_name?.message} {...registerField("last_name")} />
        </div>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput label={t("phone")} error={errors.phone?.message} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
          )}
        />
        <Input label={t("email")} type="email" autoComplete="email" error={errors.email?.message} {...registerField("email")} />
        <Button type="submit" size="lg" disabled={mutation.isPending} className="mt-2">
          {mutation.isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
      <p className="body-md mt-6 text-center text-on-surface-variant">
        {t("haveAccount")}{" "}
        <Link href="/auth/login" className="gs-underline font-semibold text-primary">
          {t("logIn")}
        </Link>
      </p>
    </Card>
  );
}
