"use client";

import { RequireAuth } from "@/lib/guards/RequireAuth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
