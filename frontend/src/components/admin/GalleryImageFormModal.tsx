"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGalleryImage, updateGalleryImage } from "@/lib/api/endpoints/adminGallery";
import { revalidateGallery } from "@/lib/actions/revalidateGallery";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";
import { getImageUrl } from "@/lib/utils/image";
import { galleryImageFormSchema, type GalleryImageFormValues } from "@/lib/utils/validators";
import type { GalleryCategory, GalleryImage } from "@/types/gallery";

interface GalleryImageFormModalProps {
  open: boolean;
  onClose: () => void;
  image: GalleryImage | null;
  categories: GalleryCategory[];
}

export function GalleryImageFormModal({ open, onClose, image, categories }: GalleryImageFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!image;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(image?.image ? getImageUrl(image.image) : null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GalleryImageFormValues>({
    resolver: zodResolver(galleryImageFormSchema),
    defaultValues: {
      title: image?.title ?? "",
      description: image?.description ?? "",
      category: image?.category ?? null,
      is_featured: image?.is_featured ?? false,
      order: image?.order ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      setImageFile(null);
      setImageError(null);
      setImagePreview(image?.image ? getImageUrl(image.image) : null);
      reset({
        title: image?.title ?? "",
        description: image?.description ?? "",
        category: image?.category ?? null,
        is_featured: image?.is_featured ?? false,
        order: image?.order ?? 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, image]);

  const mutation = useMutation({
    mutationFn: (values: GalleryImageFormValues) =>
      isEdit
        ? updateGalleryImage(image!.id, { ...values, image: imageFile ?? undefined })
        : createGalleryImage({ ...values, image: imageFile ?? undefined }),
    onSuccess: async () => {
      toast(isEdit ? "Image updated" : "Image added", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-images"] });
      await revalidateGallery();
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

  function onSubmit(values: GalleryImageFormValues) {
    if (!isEdit && !imageFile) {
      setImageError("Image is required");
      return;
    }
    mutation.mutate(values);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-inverse-surface/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-lg bg-surface-container-lowest p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="title-lg text-on-surface">{isEdit ? "Edit Image" : "New Image"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-on-surface-variant hover:text-on-surface">
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
                  <Icon name="image" className="text-[24px] text-outline" />
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

          <Input label="Title" error={errors.title?.message} {...register("title")} />
          <Textarea label="Description (optional)" {...register("description")} />

          <Select
            label="Category (optional)"
            value={watch("category") ?? ""}
            onChange={(e) => setValue("category", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Sort Order" type="number" {...register("order", { valueAsNumber: true })} />
            <label className="flex items-center gap-2 self-end pb-2.5 label-md text-on-surface">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...register("is_featured")} />
              Featured (shown on the About page)
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
