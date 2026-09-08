"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCategoryPermanently, getAllAdminCategories, setCategoryActive } from "@/lib/api/endpoints/adminCategories";
import { revalidateCategories } from "@/lib/actions/revalidateCategories";
import { revalidateProducts } from "@/lib/actions/revalidateProducts";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AppImage } from "@/components/ui/AppImage";
import { getImageUrl } from "@/lib/utils/image";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import type { Category } from "@/types/category";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmingSlug, setConfirmingSlug] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getAllAdminCategories(),
  });

  const toggleActive = useMutation({
    mutationFn: ({ slug, isActive }: { slug: string; isActive: boolean }) => setCategoryActive(slug, isActive),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await revalidateCategories();
      await revalidateProducts();
      toast("Status updated", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  const deleteCategory = useMutation({
    mutationFn: (slug: string) => deleteCategoryPermanently(slug),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await revalidateCategories();
      await revalidateProducts();
      toast("Category permanently deleted", "success");
      setConfirmingSlug(null);
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  function openCreate() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="headline-md text-on-surface">Categories</h1>
          <p className="body-md text-on-surface-variant">Manage product categories.</p>
        </div>
        <Button onClick={openCreate}>
          <Icon name="add" className="text-[18px]" />
          New Category
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState icon="category" title="No categories" description="Add your first category using the button above." />
      )}

      {data && data.length > 0 && (
        <Table>
          <Thead>
            <Tr>
              <Th>Image</Th>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Products</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((category) => (
              <Tr key={category.id}>
                <Td>
                  <div className="h-10 w-10 overflow-hidden rounded-lg border border-outline-variant">
                    <AppImage src={getImageUrl(category.image)} alt={category.name} className="h-full w-full" />
                  </div>
                </Td>
                <Td>{category.name}</Td>
                <Td className="text-on-surface-variant">{category.slug}</Td>
                <Td>{category.product_count}</Td>
                <Td>
                  <Badge tone={category.is_active ? "primary" : "neutral"}>
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Td>
                <Td>
                  {confirmingSlug === category.slug ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="label-sm text-on-surface-variant">Are you sure you want to delete this?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={deleteCategory.isPending}
                        onClick={() => deleteCategory.mutate(category.slug)}
                      >
                        Yes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmingSlug(null)}>
                        No
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        aria-label="Edit"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                      >
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive.mutate({ slug: category.slug, isActive: !category.is_active })}
                        disabled={toggleActive.isPending}
                        aria-label={category.is_active ? "Deactivate" : "Activate"}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                      >
                        <Icon name={category.is_active ? "visibility_off" : "visibility"} className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingSlug(category.slug)}
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
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        categories={data ?? []}
      />
    </div>
  );
}
