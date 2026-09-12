"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminCompany, updateCompany } from "@/lib/api/endpoints/company";
import { revalidateCompanyStats } from "@/lib/actions/revalidateCompany";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { getImageUrl } from "@/lib/utils/image";
import { companyFormSchema, type CompanyFormValues } from "@/lib/utils/validators";
import type { Company } from "@/types/company";

function toDefaults(data: Company): CompanyFormValues {
  return {
    name: data.name,
    tagline: data.tagline,
    tagline_ar: data.tagline_ar,
    description: data.description,
    description_ar: data.description_ar,
    mission: data.mission,
    mission_ar: data.mission_ar,
    vision: data.vision,
    vision_ar: data.vision_ar,
    founded_year: data.founded_year,
    employee_count: data.employee_count,
    phone: data.phone,
    email: data.email,
    address: data.address,
    website: data.website,
    experience_years: data.experience_years,
    product_types: data.product_types,
    partner_stores: data.partner_stores,
    export_countries: data.export_countries,
  };
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "superadmin";
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-company"],
    queryFn: () => getAdminCompany(),
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      tagline: "",
      tagline_ar: "",
      description: "",
      description_ar: "",
      mission: "",
      mission_ar: "",
      vision: "",
      vision_ar: "",
      founded_year: null,
      employee_count: "",
      phone: "",
      email: "",
      address: "",
      website: "",
      experience_years: "",
      product_types: "",
      partner_stores: "",
      export_countries: "",
    },
  });

  useEffect(() => {
    if (data) {
      reset(toDefaults(data));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogoPreview(data.logo ? getImageUrl(data.logo) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: CompanyFormValues) => updateCompany({ ...values, logo: logoFile ?? undefined }),
    onSuccess: async (updated) => {
      toast("Company information updated", "success");
      queryClient.setQueryData(["admin-company"], updated);
      setLogoFile(null);
      await revalidateCompanyStats();
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-md text-on-surface">Settings</h1>
        <p className="body-md text-on-surface-variant">
          Manage the &quot;About Us&quot; page and the homepage statistics section from here.
        </p>
        {!isSuperAdmin && (
          <p className="label-sm mt-2 text-on-surface-variant">
            Only a superadmin can edit this section — shown below in view-only mode.
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && (
        <Card className="max-w-3xl p-6">
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="flex flex-col gap-6"
          >
            <fieldset disabled={!isSuperAdmin} className="contents">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
                  {logoPreview ? (
                    <AppImage src={logoPreview} alt="" className="h-full w-full" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <Icon name="business" className="text-[28px] text-outline" />
                    </span>
                  )}
                </div>
                {isSuperAdmin && (
                  <label className="label-md cursor-pointer text-primary hover:underline">
                    Choose Logo
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Name" error={errors.name?.message} {...register("name")} />
                <Input label="Tagline" {...register("tagline")} />
              </div>

              <Textarea label="Description / History" {...register("description")} />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Textarea label="Mission" {...register("mission")} />
                <Textarea label="Vision" {...register("vision")} />
              </div>

              {isSuperAdmin && (
                <div className="flex flex-col gap-3 rounded-lg border border-outline-variant p-4">
                  <div>
                    <p className="label-md text-on-surface">Arabic content</p>
                    <p className="label-sm text-on-surface-variant">
                      Shown on the About Us page when a shopper switches to Arabic. Leave
                      blank to fall back to English.
                    </p>
                  </div>
                  <Input label="Tagline (Arabic)" dir="rtl" {...register("tagline_ar")} />
                  <Textarea label="Description / History (Arabic)" dir="rtl" {...register("description_ar")} />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Textarea label="Mission (Arabic)" dir="rtl" {...register("mission_ar")} />
                    <Textarea label="Vision (Arabic)" dir="rtl" {...register("vision_ar")} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Input
                  label="Founded Year"
                  type="number"
                  {...register("founded_year", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                />
                <Input label="Employee Count" placeholder="e.g. 500+" {...register("employee_count")} />
                <Input label="Phone" {...register("phone")} />
                <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Address" {...register("address")} />
                <Input label="Website" error={errors.website?.message} {...register("website")} />
              </div>

              <div className="border-t border-outline-variant pt-4">
                <p className="label-md mb-4 text-on-surface-variant">
                  Homepage Statistics
                </p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Input
                    label="Years of Experience"
                    placeholder="e.g. 25+"
                    error={errors.experience_years?.message}
                    {...register("experience_years")}
                  />
                  <Input
                    label="Product Types"
                    placeholder="e.g. 100+"
                    error={errors.product_types?.message}
                    {...register("product_types")}
                  />
                  <Input
                    label="Partner Stores"
                    placeholder="e.g. 100+"
                    error={errors.partner_stores?.message}
                    {...register("partner_stores")}
                  />
                  <Input
                    label="Export Countries"
                    placeholder="e.g. 10+"
                    error={errors.export_countries?.message}
                    {...register("export_countries")}
                  />
                </div>
              </div>
            </fieldset>

            {isSuperAdmin && (
              <div className="mt-2 flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}
