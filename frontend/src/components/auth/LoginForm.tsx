"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { login, fetchProfile } from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { toast } from "@/lib/stores/toastStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { loginSchema, type LoginFormValues } from "@/lib/utils/validators";

function LoginFormInner() {
  const t = useTranslations("Auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const tokens = await login(values);
      useAuthStore.getState().setTokens(tokens);
      const user = await fetchProfile();
      return { tokens, user };
    },
    onSuccess: ({ tokens, user }) => {
      setAuth(tokens, user);
      toast(t("welcome", { name: user.first_name || user.username }), "success");
      router.push(searchParams.get("next") || "/");
    },
    onError: (error) => toast(parseApiError(error).message || t("error"), "error"),
  });

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="headline-md mb-6 text-center text-on-surface">{t("title")}</h1>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="gs-stagger flex flex-col gap-4">
        <Input
          label={t("username")}
          autoComplete="username"
          autoFocus
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label={t("password")}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" size="lg" disabled={mutation.isPending} className="mt-2">
          {mutation.isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
      <p className="body-md mt-6 text-center text-on-surface-variant">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="gs-underline font-semibold text-primary">
          {t("signUp")}
        </Link>
      </p>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
