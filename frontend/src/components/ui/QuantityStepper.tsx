"use client";

import { Icon } from "./Icon";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max }: QuantityStepperProps) {
  const clamp = (n: number) => Math.max(min, max ? Math.min(max, n) : n);

  return (
    <div className="inline-flex items-center rounded-lg border border-outline-variant">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        className="flex h-11 w-11 items-center justify-center text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
        aria-label="Decrease"
      >
        <Icon name="remove" className="text-[18px]" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          if (!Number.isNaN(parsed)) onChange(clamp(parsed));
        }}
        className="h-11 w-14 border-x border-outline-variant text-center body-md [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={max !== undefined && value >= max}
        className="flex h-11 w-11 items-center justify-center text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
        aria-label="Increase"
      >
        <Icon name="add" className="text-[18px]" />
      </button>
    </div>
  );
}
