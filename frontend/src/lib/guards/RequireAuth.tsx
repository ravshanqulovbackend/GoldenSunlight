"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Spinner } from "@/components/ui/Spinner";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  useEffect(() => {
    if (isHydrated && !access) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, access, pathname, router]);

  if (!isHydrated || !access) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
