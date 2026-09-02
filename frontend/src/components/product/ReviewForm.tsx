"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/lib/api/endpoints/reviews";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import { reviewSchema, type ReviewFormValues } from "@/lib/utils/validators";

export function ReviewForm({ productId, productSlug }: { productId: number; productSlug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const access = useAuthStore((s) => s.access);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [hoverRating, setHoverRating] = useState(0);

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
      createReview(productId, { rating: values.rating, comment: values.comment }),
    onSuccess: () => {
      toast("Review added", "success");
      reset({ rating: 0, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      router.refresh();
    },
    onError: (error) => toast(parseApiError(error).message || "Failed to add review", "error"),
  });

  if (!isHydrated) return null;

  if (!access) {
    return (
      <p className="body-md text-on-surface-variant">
        To leave a review,{" "}
        <button
          type="button"
          onClick={() => router.push(`/auth/login?next=${encodeURIComponent(`/products/${productSlug}`)}`)}
          className="font-semibold text-primary hover:underline"
        >
          log in
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
            aria-label={`${star} star`}
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

      <Textarea placeholder="Share your thoughts (optional)" {...register("comment")} />

      <Button type="submit" variant="outline" size="sm" disabled={mutation.isPending} className="w-fit">
        {mutation.isPending ? "Submitting..." : "Leave a Review"}
      </Button>
    </form>
  );
}
