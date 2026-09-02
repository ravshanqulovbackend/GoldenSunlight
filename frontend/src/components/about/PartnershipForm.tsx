"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createPartnershipRequest } from "@/lib/api/endpoints/partnerships";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { partnershipFormSchema, type PartnershipFormValues } from "@/lib/utils/validators";

export function PartnershipForm() {
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
      toast("Your request has been sent, we'll be in touch soon", "success");
      reset();
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred while sending", "error"),
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Full Name" error={errors.full_name?.message} {...register("full_name")} />
        <Input label="Company Name (optional)" {...register("company_name")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
        <Input label="Email (optional)" type="email" error={errors.email?.message} {...register("email")} />
      </div>
      <Textarea label="Message (optional)" placeholder="Tell us about your partnership proposal" {...register("message")} />
      <Button type="submit" disabled={mutation.isPending} className="w-fit">
        {mutation.isPending ? "Sending..." : "Send Request"}
      </Button>
    </form>
  );
}
