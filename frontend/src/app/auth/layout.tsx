"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

function RedirectIfAuthenticated() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  useEffect(() => {
    if (isHydrated && access) {
      router.replace(searchParams.get("next") || "/");
    }
  }, [isHydrated, access, router, searchParams]);

  return null;
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-surface-container-low px-margin-mobile py-16">
      <Suspense fallback={null}>
        <RedirectIfAuthenticated />
      </Suspense>
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center headline-md uppercase tracking-wide text-primary">
          GoldenSunlight
        </Link>
        {children}
      </div>
    </main>
  );
}
