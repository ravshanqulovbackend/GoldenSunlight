import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import type { Address } from "@/types/address";

interface AddressFormProps {
  addresses: Address[];
  selectedAddressId: number | null;
  onSelectAddress: (id: number | null) => void;
  addressText: string;
  onAddressTextChange: (value: string) => void;
  error?: string;
}

export function AddressForm({
  addresses,
  selectedAddressId,
  onSelectAddress,
  addressText,
  onAddressTextChange,
  error,
}: AddressFormProps) {
  const t = useTranslations("Checkout");
  return (
    <div className="flex flex-col gap-3">
      {addresses.map((address) => (
        <label
          key={address.id}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
            selectedAddressId === address.id ? "border-primary bg-primary-container/20" : "border-outline-variant"
          )}
        >
          <input
            type="radio"
            name="address"
            checked={selectedAddressId === address.id}
            onChange={() => onSelectAddress(address.id)}
            className="mt-1 accent-primary"
          />
          <div>
            <p className="label-md font-semibold text-on-surface">{address.title || t("addressFallback")}</p>
            <p className="body-md text-on-surface-variant">
              {[address.city, address.district, address.street, address.building].filter(Boolean).join(", ")}
            </p>
          </div>
        </label>
      ))}

      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
          selectedAddressId === null ? "border-primary bg-primary-container/20" : "border-outline-variant"
        )}
      >
        <input
          type="radio"
          name="address"
          checked={selectedAddressId === null}
          onChange={() => onSelectAddress(null)}
          className="mt-1 accent-primary"
        />
        <div className="flex-1">
          <p className="label-md font-semibold text-on-surface">{t("differentAddress")}</p>
          {selectedAddressId === null && (
            <Textarea
              value={addressText}
              onChange={(e) => onAddressTextChange(e.target.value)}
              placeholder={t("fullAddressPlaceholder")}
              className="mt-2"
              error={error}
            />
          )}
        </div>
      </label>
    </div>
  );
}
