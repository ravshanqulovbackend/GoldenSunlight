"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { verifyEmail, resendVerificationEmail } from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { parseApiError, apiErrorFieldEntries } from "@/lib/api/parseApiError";
import { toast } from "@/lib/stores/toastStore";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/** Faqat email bor-u hali tasdiqlanmagan mijozga ko'rinadi (`users/views.py`dagi
 * `email_verified`/`VerifyEmailView` bilan bir xil holat) — ro'yxatdan o'tish
 * bloklanmagani uchun (non-blocking) bu shunchaki eslatma, majburiy ekran emas. */
export function EmailVerificationBanner() {
  const t = useTranslations("EmailVerification");
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const verifyMutation = useMutation({
    mutationFn: () => verifyEmail(code),
    onSuccess: (updated) => {
      setUser(updated);
      setCode("");
      toast(t("verified"), "success");
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      const codeMessage = apiErrorFieldEntries(apiError.body).find(([field]) => field === "code")?.[1];
      setCodeError(codeMessage || apiError.message || t("invalidCode"));
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendVerificationEmail(),
    onSuccess: () => toast(t("resent"), "success"),
    onError: (error) => toast(parseApiError(error).message || t("resendError"), "error"),
  });

  if (!user || !user.email || user.email_verified) return null;

  return (
    <Card className="flex flex-col gap-3 border-secondary/40 bg-secondary-container/30 p-5">
      <div className="flex items-start gap-3">
        <Icon name="mark_email_unread" className="mt-0.5 text-[22px] shrink-0 text-on-secondary-container" />
        <div className="min-w-0">
          <p className="label-md font-semibold text-on-secondary-container">{t("title")}</p>
          <p className="body-md text-on-secondary-container/80 break-words">{t("description", { email: user.email })}</p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCodeError("");
          verifyMutation.mutate();
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <div className="w-36">
          <Input
            label={t("codeLabel")}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setCodeError("");
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            error={codeError}
          />
        </div>
        <Button type="submit" size="sm" disabled={code.length !== 6 || verifyMutation.isPending}>
          {verifyMutation.isPending ? t("verifying") : t("verify")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={resendMutation.isPending}
          onClick={() => resendMutation.mutate()}
        >
          {resendMutation.isPending ? t("resending") : t("resend")}
        </Button>
      </form>
    </Card>
  );
}
