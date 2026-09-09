"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { updateProfile, updateProfileMultipart } from "@/lib/api/endpoints/auth";
import { useAuthStore, logoutAndRedirect } from "@/lib/stores/authStore";
import { useAddresses, useCreateAddress, useDeleteAddress } from "@/lib/query/hooks/useAddresses";
import { parseApiError } from "@/lib/api/parseApiError";
import { toast } from "@/lib/stores/toastStore";
import { getImageUrl } from "@/lib/utils/image";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { addressSchema, type AddressFormValues } from "@/lib/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROLE_LABELS, type User } from "@/types/auth";

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nothing on this page is editable for superadmin (no first name/last name/address needed).
  useEffect(() => {
    if (user && user.role === "superadmin") {
      router.replace("/");
    }
  }, [user, router]);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, control: profileControl } = useForm<ProfileFormValues>({
    values: user
      ? { first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone }
      : undefined,
  });

  const profileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => updateProfile(values),
    onSuccess: (updated: User) => {
      setUser(updated);
      toast("Profile updated", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  const avatarMutation = useMutation({
    mutationFn: (avatar: File) => updateProfileMultipart({ avatar }),
    onSuccess: (updated: User) => {
      setUser(updated);
      toast("Photo updated", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "Error uploading photo", "error"),
  });

  const isStaff = user?.role === "staff";
  const { data: addressesData, isLoading: addressesLoading } = useAddresses({ enabled: isStaff });
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    control: addressControl,
    formState: { errors: addressErrors },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });

  if (!user || user.role === "superadmin") {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Profile" }]} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="headline-md text-on-surface">Profile</h1>
        <Button variant="outline" onClick={() => logoutAndRedirect()}>
          <Icon name="logout" className="text-[18px]" />
          Log Out
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="title-lg text-on-surface">Personal Information</h2>
          <p className="label-sm text-on-surface-variant">
            Username: <span className="text-on-surface">{user.username}</span> • Role:{" "}
            <span className="text-on-surface">{ROLE_LABELS[user.role]}</span>
          </p>

          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 overflow-hidden rounded-full bg-primary text-on-primary title-lg">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getImageUrl(user.avatar)} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                </span>
              )}
            </span>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) avatarMutation.mutate(file);
                }}
              />
              <Button type="button" variant="outline" size="sm" disabled={avatarMutation.isPending} onClick={() => fileInputRef.current?.click()}>
                {avatarMutation.isPending ? "Uploading..." : "Change Photo"}
              </Button>
            </div>
          </div>

          <form
            onSubmit={handleProfileSubmit((values) => profileMutation.mutate(values))}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" {...registerProfile("first_name")} />
              <Input label="Last Name" {...registerProfile("last_name")} />
            </div>
            <Input label="Email" type="email" {...registerProfile("email")} />
            <Controller
              control={profileControl}
              name="phone"
              render={({ field }) => (
                <PhoneInput label="Phone" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
              )}
            />
            <Button type="submit" disabled={profileMutation.isPending} className="w-fit">
              {profileMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        </Card>

        {isStaff && (
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="title-lg text-on-surface">My Addresses</h2>

          {addressesLoading ? (
            <Spinner />
          ) : (
            <div className="flex flex-col gap-3">
              {addressesData?.results.map((address) => (
                <div key={address.id} className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant p-4">
                  <div className="min-w-0 flex-1">
                    <p className="label-md font-semibold text-on-surface">{address.title || "Address"}</p>
                    <p className="body-md text-on-surface-variant">
                      {[address.city, address.district, address.street, address.building].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAddress.mutate(address.id)}
                    aria-label="Delete"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              ))}
              {addressesData?.results.length === 0 && (
                <p className="body-md text-on-surface-variant">No address added yet.</p>
              )}
            </div>
          )}

          <form
            onSubmit={handleAddressSubmit((values) => {
              createAddress.mutate(values, { onSuccess: () => resetAddress() });
            })}
            className="mt-4 grid grid-cols-1 gap-4 border-t border-outline-variant pt-4 sm:grid-cols-2"
          >
            <Input label="Name (e.g. Home)" {...registerAddress("title")} />
            <Input label="Full Name" error={addressErrors.full_name?.message} {...registerAddress("full_name")} />
            <Controller
              control={addressControl}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  label="Phone"
                  error={addressErrors.phone?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Input label="City" error={addressErrors.city?.message} {...registerAddress("city")} />
            <Input label="District" {...registerAddress("district")} />
            <Input label="Street" error={addressErrors.street?.message} {...registerAddress("street")} />
            <Input label="Building" {...registerAddress("building")} />
            <Input label="Apartment" {...registerAddress("apartment")} />
            <Button type="submit" disabled={createAddress.isPending} className="w-fit sm:col-span-2">
              Add Address
            </Button>
          </form>
        </Card>
        )}
      </div>
    </div>
  );
}
