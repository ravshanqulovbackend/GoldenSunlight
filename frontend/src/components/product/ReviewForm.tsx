"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { createReview } from "@/lib/api/endpoints/reviews";
import { revalidateReviews } from "@/lib/actions/revalidateReviews";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { reviewSchema, type ReviewFormValues } from "@/lib/utils/validators";

export function ReviewForm({ productId, productSlug }: { productId: number; productSlug: string }) {
  const t = useTranslations("ReviewForm");
  const router = useRouter();
  const access = useAuthStore((s) => s.access);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [hoverRating, setHoverRating] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });
  const rating = watch("rating");

  const mutation = useMutation({
    mutationFn: (values: ReviewFormValues) =>
      createReview(productId, { rating: values.rating, comment: values.comment, image: imageFile }),
    onSuccess: async () => {
      toast(t("added"), "success");
      reset({ rating: 0, comment: "" });
      removeImage();
      await revalidateReviews(productId, productSlug);
      router.refresh();
    },
    onError: (error) => toast(parseApiError(error).message || t("addError"), "error"),
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  if (!isHydrated) return null;

  if (!access) {
    return (
      <p className="body-md text-on-surface-variant">
        {t("loginPrompt")}{" "}
        <button
          type="button"
          onClick={() => router.push(`/auth/login?next=${encodeURIComponent(`/products/${productSlug}`)}`)}
          className="font-semibold text-primary hover:underline"
        >
          {t("logIn")}
        </button>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setValue("rating", star, { shouldValidate: true })}
            aria-label={t("starLabel", { star })}
          >
            <Icon
              name="star"
              filled={star <= (hoverRating || rating)}
              className={cn(star <= (hoverRating || rating) ? "text-secondary" : "text-outline-variant", "text-[24px]")}
            />
          </button>
        ))}
      </div>
      {errors.rating && <span className="label-sm text-error">{errors.rating.message}</span>}

      <Textarea placeholder={t("sharePlaceholder")} {...register("comment")} />

      {imagePreview ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="" className="h-24 w-24 rounded-lg object-cover" />
          <button
            type="button"
            onClick={removeImage}
            aria-label={t("removeImage")}
            className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-inverse-surface text-inverse-on-surface"
          >
            <Icon name="close" className="text-[14px]" />
          </button>
        </div>
      ) : (
        <label className="label-md flex w-fit cursor-pointer items-center gap-2 text-primary hover:underline">
          <Icon name="add_photo_alternate" className="text-[20px]" />
          {t("addPhoto")}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      )}

      <Button type="submit" variant="outline" size="sm" disabled={mutation.isPending} className="w-fit">
        {mutation.isPending ? t("submitting") : t("leaveReview")}
      </Button>
    </form>
  );
}
