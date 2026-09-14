"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGalleryCategory, updateGalleryCategory } from "@/lib/api/endpoints/adminGallery";
import { revalidateGallery } from "@/lib/actions/revalidateGallery";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { slugify } from "@/lib/utils/slugify";
import { galleryCategoryFormSchema, type GalleryCategoryFormValues } from "@/lib/utils/validators";
import type { GalleryCategory } from "@/types/gallery";

interface GalleryCategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category: GalleryCategory | null;
}

export function GalleryCategoryFormModal({ open, onClose, category }: GalleryCategoryFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!category;
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GalleryCategoryFormValues>({
    resolver: zodResolver(galleryCategoryFormSchema),
    defaultValues: { name: category?.name ?? "", slug: category?.slug ?? "" },
  });

  useEffect(() => {
    if (open) {
      setSlugTouched(isEdit);
      reset({ name: category?.name ?? "", slug: category?.slug ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  const nameValue = watch("name");
  useEffect(() => {
    if (!isEdit && !slugTouched) {
      setValue("slug", slugify(nameValue || ""));
    }
  }, [nameValue, slugTouched, isEdit, setValue]);

  const mutation = useMutation({
    mutationFn: (values: GalleryCategoryFormValues) =>
      isEdit ? updateGalleryCategory(category!.id, values) : createGalleryCategory(values),
    onSuccess: async () => {
      toast(isEdit ? "Category updated" : "Category added", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-categories"] });
      await revalidateGallery();
      onClose();
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center overflow-y-auto bg-inverse-surface/40 px-4 py-8 backdrop-blur-[2px]">
      <div className="w-full max-w-md animate-scale-in rounded-lg bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="title-lg text-on-surface">{isEdit ? "Edit Category" : "New Gallery Category"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="gs-icon-btn rounded-full text-on-surface-variant hover:rotate-90 hover:text-error">
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Input
            label="Slug"
            error={errors.slug?.message}
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />

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
