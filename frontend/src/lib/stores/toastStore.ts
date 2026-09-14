import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
  /** `true` bo'lgach Toast chiqish animatsiyasini o'ynaydi, keyin DOMdan olinadi. */
  leaving?: boolean;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, variant?: Toast["variant"]) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/** Toast'ning chiqish animatsiyasi davomiyligi (Toast.tsx'dagi `duration-250` bilan mos). */
const LEAVE_ANIMATION_MS = 260;
const VISIBLE_MS = 4000;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (message, variant = "info") => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    setTimeout(() => get().dismiss(id), VISIBLE_MS);
  },
  /**
   * Darhol o'chirmaydi: avval `leaving` bayrog'ini qo'yadi (CSS chiqish
   * animatsiyasi shu orqali boshlanadi), animatsiya tugagach ro'yxatdan olib
   * tashlaydi. Ikki marta chaqirilsa (avtomatik taymer + "Yopish" tugmasi)
   * ikkinchisi e'tiborsiz qoldiriladi.
   */
  dismiss: (id) => {
    const existing = get().toasts.find((t) => t.id === id);
    if (!existing || existing.leaving) return;

    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, LEAVE_ANIMATION_MS);
  },
}));

export function toast(message: string, variant?: Toast["variant"]) {
  useToastStore.getState().push(message, variant);
}
