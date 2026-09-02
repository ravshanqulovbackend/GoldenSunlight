"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, getBrandsForAdmin, updateProduct } from "@/lib/api/endpoints/adminProducts";
import { getAllAdminCategories } from "@/lib/api/endpoints/adminCategories";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";
import { Spinner } from "@/components/ui/Spinner";
import { getImageUrl } from "@/lib/utils/image";
import { slugify } from "@/lib/utils/slugify";
import { productFormSchema, type ProductFormValues } from "@/lib/utils/validators";
import type { ProductAdmin } from "@/types/product";

const REQUIRED_FIELD_LABELS: Partial<Record<keyof ProductFormValues, string>> = {
  name: "Name",
  slug: "Slug",
  price: "Price",
  category: "Category",
  stock: "Stock",
};

interface ProductFormProps {
  product?: ProductAdmin | null;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!product;
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product ? getImageUrl(product.image) : null);
  const [imageError, setImageError] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAllAdminCategories,
  });
  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: getBrandsForAdmin,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      old_price: product?.old_price ?? "",
      category: product?.category,
      brand: product?.brand ?? null,
      ingredients: product?.ingredients ?? "",
      badge: product?.badge ?? "",
      sku: product?.sku ?? "",
      stock: product?.stock ?? 0,
      is_active: product?.is_active ?? true,
      is_popular: product?.is_popular ?? false,
      is_featured: product?.is_featured ?? false,
    },
  });

  const nameValue = watch("name");
  useEffect(() => {
    if (!isEdit && !slugTouched) {
      setValue("slug", slugify(nameValue || ""));
    }
  }, [nameValue, slugTouched, isEdit, setValue]);

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      isEdit
        ? updateProduct(product!.slug, { ...values, image: imageFile ?? undefined })
        : createProduct({ ...values, image: imageFile ?? undefined }),
    onSuccess: () => {
      toast(isEdit ? "Product updated" : "Product added", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      router.push("/admin/products");
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

  /** Finds the form field with the given name, scrolls it into view, and focuses
   * it — since the form is long and the "Save" button is fixed at the bottom,
   * an error message could otherwise end up off-screen and hard for the user
   * to notice. */
  function focusField(name: string) {
    const el = document.querySelector<HTMLElement>(`[name="${name}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  }

  function onInvalid(formErrors: FieldErrors<ProductFormValues>) {
    const missingLabels = (Object.keys(formErrors) as (keyof ProductFormValues)[])
      .map((key) => REQUIRED_FIELD_LABELS[key])
      .filter((label): label is string => !!label);
    if (!isEdit && !imageFile) missingLabels.unshift("Image");

    toast(
      missingLabels.length > 0
        ? `Required: ${missingLabels.join(", ")}`
        : "There are errors in the form",
      "error"
    );

    const firstFieldName = Object.keys(formErrors)[0];
    if (firstFieldName) {
      focusField(firstFieldName);
    } else if (!isEdit && !imageFile) {
      document.querySelector('input[type="file"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function onSubmit(values: ProductFormValues) {
    if (!isEdit && !imageFile) {
      setImageError("Product image is required");
      toast("Product image is required", "error");
      document.querySelector('input[type="file"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    mutation.mutate(values);
  }

  if (categoriesLoading || brandsLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
          {imagePreview ? (
            <AppImage src={imagePreview} alt="" className="h-full w-full" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <Icon name="inventory_2" className="text-[32px] text-outline" />
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

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-2">
        <Input label="Name" error={errors.name?.message} {...register("name")} />
        <Input
          label="Slug"
          error={errors.slug?.message}
          {...register("slug", { onChange: () => setSlugTouched(true) })}
        />

        <Input label="Price (so'm)" type="number" error={errors.price?.message} {...register("price")} />
        <Input label="Old Price (optional)" type="number" {...register("old_price")} />

        <Input label="SKU (optional)" {...register("sku")} />
        <Input label="Stock (units)" type="number" error={errors.stock?.message} {...register("stock", { valueAsNumber: true })} />

        <Select
          label="Category"
          name="category"
          value={watch("category") ?? ""}
          onChange={(e) => setValue("category", Number(e.target.value), { shouldValidate: true })}
        >
          <option value="">— Select —</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {errors.category && <span className="label-sm text-error">{errors.category.message}</span>}

        <Select
          label="Brand (optional)"
          value={watch("brand") ?? ""}
          onChange={(e) => setValue("brand", e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— No brand —</option>
          {brands?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>

        <Input label="Badge (e.g. New, Sale)" {...register("badge")} />
      </div>

      <div className="flex flex-wrap gap-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <label className="flex items-center gap-2 label-md text-on-surface">
          <input type="checkbox" className="h-4 w-4 accent-primary" {...register("is_active")} />
          Active
        </label>
        <label className="flex items-center gap-2 label-md text-on-surface">
          <input type="checkbox" className="h-4 w-4 accent-primary" {...register("is_popular")} />
          Popular
        </label>
        <label className="flex items-center gap-2 label-md text-on-surface">
          <input type="checkbox" className="h-4 w-4 accent-primary" {...register("is_featured")} />
          Featured
        </label>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <Textarea label="Description" {...register("description")} />
        <Textarea label="Ingredients" {...register("ingredients")} />
      </div>

      <div className="fixed bottom-0 left-64 right-0 flex justify-end gap-3 border-t border-outline-variant bg-surface-container-lowest px-8 py-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
