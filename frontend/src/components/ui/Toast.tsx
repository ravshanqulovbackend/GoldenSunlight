"use client";

import { useToastStore } from "@/lib/stores/toastStore";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./Icon";

const variantClasses = {
  success: "bg-primary text-on-primary",
  error: "bg-error text-on-error",
  info: "bg-inverse-surface text-inverse-on-surface",
};

const variantIcon = {
  success: "check_circle",
  error: "error",
  info: "info",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          data-leaving={t.leaving ? "true" : undefined}
          className={cn(
            "pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 label-md shadow-lg",
            // Kirishda spring bilan pastdan sakrab chiqadi, yo'qolishda esa
            // `leaving` bayrog'i qo'yilgach pastga sirg'alib so'nadi (store toast'ni
            // DOMdan olib tashlashdan oldin 260 ms kutadi).
            "animate-toast-in data-[leaving=true]:animate-none data-[leaving=true]:opacity-0",
            "data-[leaving=true]:translate-y-3 data-[leaving=true]:scale-95",
            "transition-[opacity,transform,translate,scale] duration-250 ease-soft",
            variantClasses[t.variant]
          )}
        >
          <Icon name={variantIcon[t.variant]} className="text-[20px]" />
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Yopish"
            className="gs-icon-btn opacity-80 hover:opacity-100"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      ))}
    </div>
  );
}
