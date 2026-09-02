"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteProductPermanently, getAdminProducts, setProductActive } from "@/lib/api/endpoints/adminProducts";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AppImage } from "@/components/ui/AppImage";
import { getImageUrl } from "@/lib/utils/image";
import { formatPrice } from "@/lib/utils/money";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";

const PAGE_SIZE = 12;

const DEFAULT_ORDERING = "-created_at";

const SORT_OPTIONS = [
  { value: "name", label: "By name" },
  { value: "price", label: "By price" },
  { value: DEFAULT_ORDERING, label: "Date added" },
];

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [ordering, setOrdering] = useState(DEFAULT_ORDERING);
  const [confirmingSlug, setConfirmingSlug] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-products", page, search, ordering],
    queryFn: () => getAdminProducts({ page, search: search || undefined, ordering }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ slug, isActive }: { slug: string; isActive: boolean }) => setProductActive(slug, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast("Status updated", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  const deleteProduct = useMutation({
    mutationFn: (slug: string) => deleteProductPermanently(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast("Product permanently deleted", "success");
      setConfirmingSlug(null);
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="headline-md text-on-surface">Products</h1>
          <p className="body-md text-on-surface-variant">{data ? `${data.count} products` : ""}</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex">
          <Button>
            <Icon name="add" className="text-[18px]" />
            New Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
          className="flex max-w-sm flex-1 gap-2"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="h-11 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 body-md focus:border-secondary focus:outline-none"
          />
          <Button type="submit" variant="outline">
            <Icon name="search" className="text-[18px]" />
          </Button>
        </form>

        <div className="flex gap-2">
          {SORT_OPTIONS.map((option) => {
            const active = ordering === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setOrdering(option.value);
                  setPage(1);
                }}
                className={`h-11 rounded-lg border px-4 label-md transition-colors ${
                  active
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.results.length === 0 && <EmptyState icon="inventory_2" title="No products found" />}

      {data && data.results.length > 0 && (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>Image</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.results.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <Link href={`/admin/products/${product.slug}/edit`} className="block h-10 w-10 overflow-hidden rounded-lg border border-outline-variant">
                      <AppImage src={getImageUrl(product.image)} alt={product.name} className="h-full w-full" />
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`/admin/products/${product.slug}/edit`} className="hover:text-primary hover:underline">
                      {product.name}
                    </Link>
                  </Td>
                  <Td className="text-on-surface-variant">{product.category_name}</Td>
                  <Td>{formatPrice(product.price)}</Td>
                  <Td>{product.stock}</Td>
                  <Td>
                    <Badge tone={product.is_active ? "primary" : "neutral"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    {confirmingSlug === product.slug ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="label-sm text-on-surface-variant">Are you sure you want to delete this?</span>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={deleteProduct.isPending}
                          onClick={() => deleteProduct.mutate(product.slug)}
                        >
                          Yes
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmingSlug(null)}>
                          No
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.slug}/edit`}
                          aria-label="Edit"
                          className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleActive.mutate({ slug: product.slug, isActive: !product.is_active })}
                          disabled={toggleActive.isPending}
                          aria-label={product.is_active ? "Deactivate" : "Activate"}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                        >
                          <Icon name={product.is_active ? "visibility_off" : "visibility"} className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingSlug(product.slug)}
                          aria-label="Delete permanently"
                          className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    )}
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
