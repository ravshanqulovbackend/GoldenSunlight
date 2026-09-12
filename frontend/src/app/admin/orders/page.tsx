"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminOrders } from "@/lib/query/hooks/useAdminOrders";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate, formatPrice } from "@/lib/utils/money";
import { orderStatusTone } from "@/lib/utils/orderStatusTone";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types/order";

const PAGE_SIZE = 12;

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");

  const { data, isLoading, isError, refetch } = useAdminOrders({ page, search: search || undefined, status });
  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-md text-on-surface">Orders</h1>
        <p className="body-md text-on-surface-variant">{data ? `${data.count} orders` : ""}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
          className="flex max-w-sm gap-2"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Customer, phone, tracking number..."
            className="h-11 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 body-md focus:border-secondary focus:outline-none"
          />
          <Button type="submit" variant="outline">
            <Icon name="search" className="text-[18px]" />
          </Button>
        </form>

        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "");
            setPage(1);
          }}
          className="w-56"
        >
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.results.length === 0 && <EmptyState icon="receipt_long" title="No orders found" />}

      {data && data.results.length > 0 && (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th className="text-end">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.results.map((order) => (
                <Tr key={order.id}>
                  <Td className="font-semibold">#{order.id}</Td>
                  <Td>
                    <div>
                      <p className="text-on-surface">{order.full_name}</p>
                      <p className="label-sm text-on-surface-variant">{order.phone}</p>
                    </div>
                  </Td>
                  <Td className="text-on-surface-variant">{formatDate(order.created_at)}</Td>
                  <Td>{formatPrice(order.total_amount)}</Td>
                  <Td>
                    <Badge tone={orderStatusTone(order.status)}>{order.status_display}</Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        aria-label="Details"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                      >
                        <Icon name="visibility" className="text-[18px]" />
                      </Link>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="label-md text-on-surface-variant">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
