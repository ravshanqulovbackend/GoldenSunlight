"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteGalleryCategory,
  deleteGalleryImage,
  getAllAdminGalleryCategories,
  getAllAdminGalleryImages,
} from "@/lib/api/endpoints/adminGallery";
import { revalidateGallery } from "@/lib/actions/revalidateGallery";
import { GalleryCategoryFormModal } from "@/components/admin/GalleryCategoryFormModal";
import { GalleryImageFormModal } from "@/components/admin/GalleryImageFormModal";
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
import type { GalleryCategory, GalleryImage } from "@/types/gallery";

export default function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [confirmingImageId, setConfirmingImageId] = useState<number | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-gallery-categories"],
    queryFn: () => getAllAdminGalleryCategories(),
  });
  const imagesQuery = useQuery({
    queryKey: ["admin-gallery-images"],
    queryFn: () => getAllAdminGalleryImages(),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => deleteGalleryCategory(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-categories"] });
      await revalidateGallery();
      toast("Category deleted", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => deleteGalleryImage(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery-images"] });
      await revalidateGallery();
      toast("Image deleted", "success");
      setConfirmingImageId(null);
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="headline-md text-on-surface">Gallery</h1>
        <p className="body-md text-on-surface-variant">
          Manage the production photos shown on the &quot;About Us&quot; page.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="title-lg text-on-surface">Categories</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingCategory(null);
              setCategoryModalOpen(true);
            }}
          >
            <Icon name="add" className="text-[16px]" />
            Add Category
          </Button>
        </div>

        {categoriesQuery.isLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}
        {categoriesQuery.isError && <ErrorState onRetry={() => categoriesQuery.refetch()} />}

        {categoriesQuery.data && categoriesQuery.data.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categoriesQuery.data.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest py-1.5 ps-4 pe-2 label-md text-on-surface"
              >
                {category.name}
                <span className="label-sm text-on-surface-variant">({category.image_count})</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(category);
                    setCategoryModalOpen(true);
                  }}
                  aria-label="Edit"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                >
                  <Icon name="edit" className="text-[14px]" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                  disabled={deleteCategoryMutation.isPending}
                  aria-label="Delete"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="title-lg text-on-surface">Images</h2>
          <Button
            onClick={() => {
              setEditingImage(null);
              setImageModalOpen(true);
            }}
          >
            <Icon name="add" className="text-[18px]" />
            New Image
          </Button>
        </div>

        {imagesQuery.isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}
        {imagesQuery.isError && <ErrorState onRetry={() => imagesQuery.refetch()} />}
        {imagesQuery.data && imagesQuery.data.length === 0 && (
          <EmptyState icon="photo_library" title="No images" description="Add your first image using the button above." />
        )}

        {imagesQuery.data && imagesQuery.data.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {imagesQuery.data.map((image) => (
              <div key={image.id} className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
                <div className="aspect-square overflow-hidden bg-surface-container-high">
                  <AppImage src={getImageUrl(image.image)} alt={image.title} className="h-full w-full" />
                </div>
                <div className="flex flex-col gap-2 p-3">
                  <span className="label-md text-on-surface">{image.title}</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {image.category_name && <Badge tone="neutral">{image.category_name}</Badge>}
                    {image.is_featured && <Badge tone="primary">Featured</Badge>}
                  </div>
                  {confirmingImageId === image.id ? (
                    <div className="flex items-center gap-2">
                      <span className="label-sm text-on-surface-variant">Delete this?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={deleteImageMutation.isPending}
                        onClick={() => deleteImageMutation.mutate(image.id)}
                      >
                        Yes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmingImageId(null)}>
                        No
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingImage(image);
                          setImageModalOpen(true);
                        }}
                        aria-label="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                      >
                        <Icon name="edit" className="text-[16px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingImageId(image.id)}
                        aria-label="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                      >
                        <Icon name="delete" className="text-[16px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <GalleryCategoryFormModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={editingCategory}
      />
      <GalleryImageFormModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        image={editingImage}
        categories={categoriesQuery.data ?? []}
      />
    </div>
  );
}
