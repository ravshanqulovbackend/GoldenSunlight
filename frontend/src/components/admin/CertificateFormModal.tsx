"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCertificate, updateCertificate } from "@/lib/api/endpoints/adminCertificates";
import { revalidateCertificates } from "@/lib/actions/revalidateCertificates";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";
import { getImageUrl } from "@/lib/utils/image";
import { certificateFormSchema, type CertificateFormValues } from "@/lib/utils/validators";
import type { Certificate } from "@/types/certificate";

interface CertificateFormModalProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

export function CertificateFormModal({ open, onClose, certificate }: CertificateFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!certificate;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(certificate?.image ? getImageUrl(certificate.image) : null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      title: certificate?.title ?? "",
      title_ar: certificate?.title_ar ?? "",
      description: certificate?.description ?? "",
      description_ar: certificate?.description_ar ?? "",
      issued_by: certificate?.issued_by ?? "",
      issued_by_ar: certificate?.issued_by_ar ?? "",
      issued_date: certificate?.issued_date ?? "",
      expiry_date: certificate?.expiry_date ?? "",
      is_active: certificate?.is_active ?? true,
      order: certificate?.order ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageFile(null);
      setImageError(null);
      setImagePreview(certificate?.image ? getImageUrl(certificate.image) : null);
      reset({
        title: certificate?.title ?? "",
        title_ar: certificate?.title_ar ?? "",
        description: certificate?.description ?? "",
        description_ar: certificate?.description_ar ?? "",
        issued_by: certificate?.issued_by ?? "",
        issued_by_ar: certificate?.issued_by_ar ?? "",
        issued_date: certificate?.issued_date ?? "",
        expiry_date: certificate?.expiry_date ?? "",
        is_active: certificate?.is_active ?? true,
        order: certificate?.order ?? 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, certificate]);

  const mutation = useMutation({
    mutationFn: (values: CertificateFormValues) =>
      isEdit
        ? updateCertificate(certificate!.id, { ...values, image: imageFile ?? undefined })
        : createCertificate({ ...values, image: imageFile ?? undefined }),
    onSuccess: async () => {
      toast(isEdit ? "Certificate updated" : "Certificate added", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      await revalidateCertificates();
      onClose();
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageError(null);
    setImagePreview(URL.createObjectURL(file));
  }

  function onSubmit(values: CertificateFormValues) {
    if (!isEdit && !imageFile) {
      setImageError("Certificate image is required");
      return;
    }
    mutation.mutate(values);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center overflow-y-auto bg-inverse-surface/40 px-4 py-8 backdrop-blur-[2px]">
      <div className="w-full max-w-lg animate-scale-in rounded-lg bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="title-lg text-on-surface">{isEdit ? "Edit Certificate" : "New Certificate"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="gs-icon-btn rounded-full text-on-surface-variant hover:rotate-90 hover:text-error">
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
              {imagePreview ? (
                <AppImage src={imagePreview} alt="" className="h-full w-full" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Icon name="workspace_premium" className="text-[24px] text-outline" />
                </span>
              )}
            </div>
            <div>
              <label className="label-md cursor-pointer text-primary hover:underline">
                Choose Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imageError && <p className="label-sm mt-1 text-error">{imageError}</p>}
            </div>
          </div>

          <Input label="Name" error={errors.title?.message} {...register("title")} />
          <Input label="Issued By (optional)" {...register("issued_by")} />
          <Textarea label="Description (optional)" {...register("description")} />

          <div className="flex flex-col gap-3 rounded-lg border border-outline-variant p-4">
            <p className="label-sm text-on-surface-variant">
              Arabic content — leave blank to fall back to English.
            </p>
            <Input label="Name (Arabic)" dir="rtl" {...register("title_ar")} />
            <Input label="Issued By (Arabic)" dir="rtl" {...register("issued_by_ar")} />
            <Textarea label="Description (Arabic)" dir="rtl" {...register("description_ar")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Issued Date" type="date" {...register("issued_date")} />
            <Input label="Expiry Date" type="date" {...register("expiry_date")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" {...register("order", { valueAsNumber: true })} />
            <label className="flex items-center gap-2 self-end pb-2.5 label-md text-on-surface">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...register("is_active")} />
              Active
            </label>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
