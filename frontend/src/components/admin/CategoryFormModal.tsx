"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory, updateCategory } from "@/lib/api/endpoints/adminCategories";
import { revalidateCategories } from "@/lib/actions/revalidateCategories";
import { revalidateProducts } from "@/lib/actions/revalidateProducts";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";
import { getImageUrl } from "@/lib/utils/image";
import { slugify } from "@/lib/utils/slugify";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/utils/validators";
import type { Category } from "@/types/category";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  categories: Category[];
}

export function CategoryFormModal({ open, onClose, category, categories }: CategoryFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!category;
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image ? getImageUrl(category.image) : null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      name_ar: category?.name_ar ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      description_ar: category?.description_ar ?? "",
      parent: category?.parent ?? null,
      sort_order: category?.sort_order ?? 0,
      is_active: category?.is_active ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      setSlugTouched(isEdit);
      setImageFile(null);
      setImagePreview(category?.image ? getImageUrl(category.image) : null);
      reset({
        name: category?.name ?? "",
        name_ar: category?.name_ar ?? "",
        slug: category?.slug ?? "",
        description: category?.description ?? "",
        description_ar: category?.description_ar ?? "",
        parent: category?.parent ?? null,
        sort_order: category?.sort_order ?? 0,
        is_active: category?.is_active ?? true,
      });
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
    mutationFn: (values: CategoryFormValues) =>
      isEdit
        ? updateCategory(category!.slug, { ...values, image: imageFile ?? undefined })
        : createCategory({ ...values, image: imageFile ?? undefined }),
    onSuccess: async () => {
      toast(isEdit ? "Category updated" : "Category added", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await revalidateCategories();
      await revalidateProducts();
      onClose();
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  if (!open) return null;

  const parentOptions = categories.filter((c) => c.id !== category?.id);

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center overflow-y-auto bg-inverse-surface/40 px-4 py-8 backdrop-blur-[2px]">
      <div className="w-full max-w-lg animate-scale-in rounded-lg bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="title-lg text-on-surface">{isEdit ? "Edit Category" : "New Category"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="gs-icon-btn rounded-full text-on-surface-variant hover:rotate-90 hover:text-error">
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
              {imagePreview ? (
                <AppImage src={imagePreview} alt="" className="h-full w-full" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Icon name="category" className="text-[24px] text-outline" />
                </span>
              )}
            </div>
            <label className="label-md cursor-pointer text-primary hover:underline">
              Choose Image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Input
            label="Slug"
            error={errors.slug?.message}
            {...register("slug", {
              onChange: () => setSlugTouched(true),
            })}
          />
          <Textarea label="Description" {...register("description")} />

          <div className="flex flex-col gap-3 rounded-lg border border-outline-variant p-4">
            <p className="label-sm text-on-surface-variant">
              Arabic content — leave blank to fall back to English.
            </p>
            <Input label="Name (Arabic)" dir="rtl" {...register("name_ar")} />
            <Textarea label="Description (Arabic)" dir="rtl" {...register("description_ar")} />
          </div>

          <Select
            label="Parent Category (optional)"
            value={watch("parent") ?? ""}
            onChange={(e) => setValue("parent", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— None —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sort Order"
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
            />
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
