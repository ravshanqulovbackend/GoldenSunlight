"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

interface ProductTabsProps {
  description: string;
  ingredients: string;
}

export function ProductTabs({ description, ingredients }: ProductTabsProps) {
  const t = useTranslations("Products");
  const tabs = [
    { id: "description", label: t("tabDescription") },
    { id: "ingredients", label: t("tabIngredients") },
    { id: "pickup", label: t("tabPickup") },
  ];
  const [active, setActive] = useState(tabs[0].id);

  return (
    <div>
      <div className="flex gap-6 overflow-x-auto border-b border-outline-variant">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "label-md relative whitespace-nowrap py-3 text-on-surface-variant",
              "transition-colors duration-250 ease-soft hover:text-primary",
              active === tab.id && "font-semibold text-primary"
            )}
          >
            {tab.label}
            {/* Faol tabning ostidagi chiziq markazdan kengayadi */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary origin-center transition-transform duration-300 ease-soft",
                active === tab.id ? "scale-x-100" : "scale-x-0"
              )}
            />
          </button>
        ))}
      </div>

      {/* `key={active}` — tab almashganda kontent qayta mount bo'ladi va fade-up animatsiyasi ishlaydi */}
      <div key={active} className="body-md animate-fade-up py-6 text-on-surface">
        {active === "description" && (
          <p className="whitespace-pre-line">{description || t("noDescription")}</p>
        )}
        {active === "ingredients" && (
          <p className="whitespace-pre-line">{ingredients || t("noIngredients")}</p>
        )}
        {active === "pickup" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Icon name="storefront" className="mt-0.5 text-[20px] text-secondary" />
              <span>{t("pickupInfo1")}</span>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="thermostat" className="mt-0.5 text-[20px] text-secondary" />
              <span>{t("pickupInfo2")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
