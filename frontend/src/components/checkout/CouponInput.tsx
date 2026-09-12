"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { validateCoupon } from "@/lib/api/endpoints/orders";
import { parseApiError } from "@/lib/api/parseApiError";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { CouponPreview } from "@/types/order";

interface CouponInputProps {
  onApplied: (coupon: CouponPreview | null) => void;
}

/**
 * The result shown here is for preview only — the actual discount is
 * recalculated server-side via coupon_code when the order is created.
 */
export function CouponInput({ onApplied }: CouponInputProps) {
  const t = useTranslations("Checkout");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<CouponPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => validateCoupon(code.trim()),
    onSuccess: (coupon) => {
      setApplied(coupon);
      setError(null);
      onApplied(coupon);
    },
    onError: (err) => {
      setApplied(null);
      onApplied(null);
      setError(parseApiError(err).message || t("couponNotFound"));
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder={t("couponPlaceholder")}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (applied) {
              setApplied(null);
              onApplied(null);
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" disabled={!code.trim() || mutation.isPending} onClick={() => mutation.mutate()}>
          {t("apply")}
        </Button>
      </div>
      {applied && (
        <span className="label-md flex items-center gap-1 text-primary">
          <Icon name="check_circle" className="text-[18px]" />
          {t("discountApplied", { percent: applied.discount_percent })}
        </span>
      )}
      {error && <span className="label-sm text-error">{error}</span>}
    </div>
  );
}
