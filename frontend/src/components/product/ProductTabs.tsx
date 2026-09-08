"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

interface ProductTabsProps {
  description: string;
  ingredients: string;
}

export function ProductTabs({ description, ingredients }: ProductTabsProps) {
  const tabs = [
    { id: "description", label: "Description" },
    { id: "ingredients", label: "Ingredients" },
    { id: "delivery", label: "Delivery" },
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
              "label-md whitespace-nowrap border-b-2 border-transparent py-3 text-on-surface-variant transition-colors",
              active === tab.id && "border-primary font-semibold text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="body-md py-6 text-on-surface">
        {active === "description" && (
          <p className="whitespace-pre-line">{description || "No product description has been added yet."}</p>
        )}
        {active === "ingredients" && (
          <p className="whitespace-pre-line">{ingredients || "No ingredient information has been added yet."}</p>
        )}
        {active === "delivery" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Icon name="local_shipping" className="mt-0.5 text-[20px] text-secondary" />
              <span>Delivered within 1-2 days across Dubai, and 3-5 days to other Emirates.</span>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="thermostat" className="mt-0.5 text-[20px] text-secondary" />
              <span>Store in a dry place away from sunlight and out of children&apos;s reach.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
