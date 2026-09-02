"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { PendingRoleCompletionForm } from "@/components/auth/PendingRoleCompletionForm";

/**
 * Butun ilovani (barcha route'larni) qamrab oladi — foydalanuvchida `pending_role`
 * bo'lsa, u qayerga navigatsiya qilishidan qat'i nazar, profilni to'ldirish
 * ekrani ko'rsatiladi va boshqa hech narsa render qilinmaydi.
 */
export function PendingRoleGate({ children }: { children: React.ReactNode }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);

  if (isHydrated && user?.pending_role) {
    return <PendingRoleCompletionForm user={user} />;
  }

  return <>{children}</>;
}
