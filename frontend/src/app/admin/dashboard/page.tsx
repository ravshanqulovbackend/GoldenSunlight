"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/endpoints/dashboard";
import { useAuthStore } from "@/lib/stores/authStore";
import { ActivityLogTable } from "@/components/admin/ActivityLogTable";
import { SalesOverview } from "@/components/admin/SalesOverview";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatPrice } from "@/lib/utils/money";

const STAT_CARDS = [
  { key: "total_revenue" as const, label: "Total Revenue", icon: "payments", isMoney: true, href: "/admin/orders" },
  { key: "total_orders" as const, label: "Orders", icon: "shopping_bag", isMoney: false, href: "/admin/orders" },
  { key: "total_users" as const, label: "Customers", icon: "group", isMoney: false, href: "/admin/users" },
  { key: "total_products" as const, label: "Active Products", icon: "inventory_2", isMoney: false, href: "/admin/products" },
];

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboardStats,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="headline-md text-on-surface">Dashboard</h1>
        <p className="body-md text-on-surface-variant">Overall metrics and recent activity.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="gs-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="gs-lift group/stat flex items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 hover:border-primary hover:bg-surface-container-low hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform duration-400 ease-spring group-hover/stat:scale-110 group-hover/stat:rotate-6">
                <Icon name={card.icon} className="text-[24px]" />
              </span>
              <div>
                <p className="headline-md text-[1.5rem] text-on-surface">
                  {card.isMoney ? formatPrice(data[card.key] as string) : (data[card.key] as number)}
                </p>
                <p className="label-sm text-on-surface-variant">{card.label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data && user?.role === "superadmin" && <SalesOverview data={data} />}

      {user?.role === "superadmin" && <ActivityLogTable />}
    </div>
  );
}
