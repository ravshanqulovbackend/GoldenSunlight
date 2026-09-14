"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { ToastContainer } from "@/components/ui/Toast";
import { RouteProgress } from "@/components/ui/RouteProgress";
import { PendingRoleGate } from "@/lib/guards/PendingRoleGate";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    // rehydrate() fills in the state after reading from localStorage — isHydrated
    // is only set to true AFTER THAT; otherwise RequireAuth would treat the
    // not-yet-loaded token as "missing" and redirect a valid user to login.
    Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      useAuthStore.getState().setHydrated();
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteProgress />
      <PendingRoleGate>{children}</PendingRoleGate>
      <ToastContainer />
    </QueryClientProvider>
  );
}
