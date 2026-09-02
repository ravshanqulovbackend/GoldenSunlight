"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateProfileMultipart } from "@/lib/api/endpoints/auth";
import { useAuthStore, logoutAndRedirect } from "@/lib/stores/authStore";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getImageUrl } from "@/lib/utils/image";
import { pendingRoleCompletionSchema, type PendingRoleCompletionFormValues } from "@/lib/utils/validators";
import { ROLE_LABELS, type User } from "@/types/auth";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * A mandatory full-app blocking screen for a user who was given `pending_role`
 * via the Django admin — it will not close until the profile (first name, last
 * name, phone, photo) is fully filled in. Wired up via `lib/guards/PendingRoleGate.tsx`.
 */
export function PendingRoleCompletionForm({ user }: { user: User }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar ? getImageUrl(user.avatar) : null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PendingRoleCompletionFormValues>({
    resolver: zodResolver(pendingRoleCompletionSchema),
    values: { first_name: user.first_name, last_name: user.last_name, phone: user.phone },
  });

  const mutation = useMutation({
    mutationFn: (values: PendingRoleCompletionFormValues) =>
      updateProfileMultipart({ ...values, avatar: avatarFile ?? undefined }),
    onSuccess: (updated) => {
      setUser(updated);
      if (updated.pending_role) {
        toast("Information saved", "success");
      } else {
        toast(`Congratulations! You have been granted ${ROLE_LABELS[updated.role]} access.`, "success");
      }
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred while saving", "error"),
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please upload an image file only");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("Image size must not exceed 5MB");
      return;
    }
    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onSubmit(values: PendingRoleCompletionFormValues) {
    if (!avatarFile && !user.avatar) {
      setAvatarError("A profile photo is required");
      return;
    }
    mutation.mutate(values);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-surface-container-low px-margin-mobile py-10">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-primary">
            <Icon name="verified_user" className="text-[28px]" />
          </span>
          <h1 className="headline-md text-on-surface">Administrator Access Granted</h1>
          <p className="body-md text-on-surface-variant">
            You have been granted <strong className="text-on-surface">{ROLE_LABELS[user.pending_role as "admin"]}</strong> access.
            To continue, please fill in the following information about yourself first.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-outline-variant bg-surface-container-high">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="Profile photo" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Icon name="person" className="text-[40px] text-outline" />
                </span>
              )}
            </div>
            <label className="label-md cursor-pointer text-primary hover:underline">
              Choose Photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            {avatarError && <span className="label-sm text-error">{avatarError}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" autoFocus error={errors.first_name?.message} {...register("first_name")} />
            <Input label="Last Name" error={errors.last_name?.message} {...register("last_name")} />
          </div>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput label="Phone" error={errors.phone?.message} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
            )}
          />

          <Button type="submit" size="lg" disabled={mutation.isPending} className="mt-2">
            {mutation.isPending ? "Saving..." : "Save and Continue"}
          </Button>
          <button
            type="button"
            onClick={() => logoutAndRedirect()}
            className="label-md text-center text-on-surface-variant hover:text-error"
          >
            Log out to sign in with a different account
          </button>
        </form>
      </Card>
    </div>
  );
}
