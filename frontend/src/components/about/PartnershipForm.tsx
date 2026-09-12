"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { createPartnershipRequest } from "@/lib/api/endpoints/partnerships";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { partnershipFormSchema, type PartnershipFormValues } from "@/lib/utils/validators";

export function PartnershipForm() {
  const t = useTranslations("PartnershipForm");
  const tCommon = useTranslations("Common");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnershipFormValues>({
    resolver: zodResolver(partnershipFormSchema),
    defaultValues: { full_name: "", company_name: "", phone: "", email: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: PartnershipFormValues) => createPartnershipRequest(values),
    onSuccess: () => {
      toast(t("success"), "success");
      reset();
    },
    onError: (error) => toast(parseApiError(error).message || t("error"), "error"),
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label={t("fullName")} error={errors.full_name?.message} {...register("full_name")} />
        <Input label={`${t("companyName")} (${tCommon("optional")})`} {...register("company_name")} />
        <Input label={t("phone")} error={errors.phone?.message} {...register("phone")} />
        <Input label={`${t("email")} (${tCommon("optional")})`} type="email" error={errors.email?.message} {...register("email")} />
      </div>
      <Textarea
        label={`${t("message")} (${tCommon("optional")})`}
        placeholder={t("messagePlaceholder")}
        {...register("message")}
      />
      <Button type="submit" disabled={mutation.isPending} className="w-fit">
        {mutation.isPending ? t("sending") : t("sendRequest")}
      </Button>
    </form>
  );
}
