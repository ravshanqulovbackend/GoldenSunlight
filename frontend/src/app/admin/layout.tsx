"use client";

import { RequireAdmin } from "@/lib/guards/RequireAdmin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-surface">
        <AdminSidebar />
        <main className="ml-64 min-h-screen px-8 py-8">{children}</main>
      </div>
    </RequireAdmin>
  );
}
