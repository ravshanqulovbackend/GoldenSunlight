"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/lib/query/hooks/useCart";
import { useAddresses } from "@/lib/query/hooks/useAddresses";
import { useCreateOrder } from "@/lib/query/hooks/useOrders";
import { useAuthStore } from "@/lib/stores/authStore";
import { AddressForm } from "@/components/checkout/AddressForm";
import { CouponInput } from "@/components/checkout/CouponInput";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils/money";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/utils/validators";
import type { CouponPreview } from "@/types/order";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addressesData, isLoading: addressesLoading } = useAddresses();
  const createOrder = useCreateOrder();
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);

  const addresses = useMemo(() => addressesData?.results ?? [], [addressesData]);
  const defaultAddress = useMemo(() => addresses.find((a) => a.is_default) ?? null, [addresses]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address_id: null,
      address_text: "",
      landmark: "",
      notes: "",
      payment_method: "cash",
      coupon_code: "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("full_name", [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username);
      setValue("phone", user.phone);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (defaultAddress) setValue("address_id", defaultAddress.id);
  }, [defaultAddress, setValue]);

  const selectedAddressId = watch("address_id") ?? null;
  const addressText = watch("address_text") ?? "";

  const isLoading = cartLoading || addressesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
        <EmptyState
          icon="shopping_cart"
          title="Your cart is empty"
          description="Select a product before placing an order."
          actionHref="/products"
          actionLabel="View Products"
        />
      </div>
    );
  }

  // The backend uses the same formula when creating an order (orders/views.py):
  // if discount_percent > 0 it's calculated relative to the subtotal, otherwise the
  // static discount_amount is used. If this isn't calculated the same way here, the
  // "Total" shown at checkout won't match the actual created order amount.
  const discountPercent = couponPreview ? Number(couponPreview.discount_percent) : 0;
  const discount = couponPreview
    ? discountPercent > 0
      ? (cart.total_price * discountPercent) / 100
      : Number(couponPreview.discount_amount)
    : 0;
  const total = cart.total_price - discount;

  function onSubmit(values: CheckoutFormValues) {
    createOrder.mutate(
      {
        full_name: values.full_name,
        phone: values.phone,
        address_id: values.address_id ?? undefined,
        address_text: values.address_id ? "" : values.address_text,
        landmark: values.landmark,
        notes: values.notes,
        payment_method: values.payment_method,
        coupon_code: couponPreview?.code ?? "",
      },
      {
        onSuccess: (order) => router.push(`/orders/${order.id}`),
      }
    );
  }

  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Place Order" }]} />
      <h1 className="headline-md mt-4 text-on-surface">Place Order</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="title-lg text-on-surface">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" error={errors.full_name?.message} {...register("full_name")} />
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <PhoneInput label="Phone" error={errors.phone?.message} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                )}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <h2 className="title-lg text-on-surface">Address</h2>
            <AddressForm
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={(id) => setValue("address_id", id)}
              addressText={addressText}
              onAddressTextChange={(value) => setValue("address_text", value)}
              error={errors.address_text?.message}
            />
            <Input label="Landmark (optional)" placeholder="e.g. blue gate" {...register("landmark")} />
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <h2 className="title-lg text-on-surface">Additional</h2>
            <Textarea label="Comment (optional)" placeholder="Comment for the courier" {...register("notes")} />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="title-lg text-on-surface">Order Summary</h2>
            <ul className="flex flex-col gap-2 text-on-surface-variant">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 body-md">
                  <span className="line-clamp-2-custom min-w-0">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="shrink-0">{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>

            <CouponInput onApplied={setCouponPreview} />

            <div className="flex flex-col gap-1 border-t border-outline-variant pt-4 body-md text-on-surface-variant">
              <div className="flex justify-between">
                <span>Products</span>
                <span>{formatPrice(cart.total_price)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between border-t border-outline-variant pt-4 title-lg text-on-surface">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>

            <Button type="submit" size="lg" disabled={createOrder.isPending}>
              {createOrder.isPending ? "Submitting..." : "Confirm Order"}
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}
