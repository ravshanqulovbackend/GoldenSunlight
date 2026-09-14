"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { register as registerUser } from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { toast } from "@/lib/stores/toastStore";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { registerSchema, type RegisterFormValues } from "@/lib/utils/validators";

export function RegisterForm() {
  const t = useTranslations("Auth.register");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register: registerField,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) => registerUser(values),
    onSuccess: ({ user, tokens }) => {
      setAuth(tokens, user);
      toast(t("welcome", { name: user.first_name || user.username }), "success");
      router.push("/");
    },
    onError: (error) => toast(parseApiError(error).message || t("error"), "error"),
  });

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="headline-md mb-6 text-center text-on-surface">{t("title")}</h1>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="gs-stagger flex flex-col gap-4">
        <Input label={t("username")} autoComplete="username" autoFocus error={errors.username?.message} {...registerField("username")} />
        <Input
          label={t("password")}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...registerField("password")}
        />
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
