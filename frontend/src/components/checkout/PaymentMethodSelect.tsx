import { cn } from "@/lib/utils/cn";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/order";

const METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

export function PaymentMethodSelect({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {METHODS.map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => onChange(method)}
          className={cn(
            "label-md rounded-lg border px-4 py-3 text-center transition-colors",
            value === method
              ? "border-primary bg-primary-container text-on-primary-container"
              : "border-outline-variant text-on-surface hover:bg-surface-container-low"
          )}
        >
          {PAYMENT_METHOD_LABELS[method]}
        </button>
      ))}
    </div>
  );
}
