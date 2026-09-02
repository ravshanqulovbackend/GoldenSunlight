"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Spinner } from "@/components/ui/Spinner";

/** Phase 3 (admin panel) uchun tayyorlab qo'yilgan — hozircha hech qayerda ishlatilmaydi. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  useEffect(() => {
    if (isHydrated && !access) {
      router.replace("/auth/login");
    } else if (isHydrated && access && !isAdmin) {
      router.replace("/");
    }
  }, [isHydrated, access, isAdmin, router]);

  if (!isHydrated || !access || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
