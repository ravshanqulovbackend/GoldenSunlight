"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminProduct } from "@/lib/api/endpoints/adminProducts";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-product", params.slug],
    queryFn: () => getAdminProduct(params.slug),
  });

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Products", href: "/admin/products" },
          { label: product?.name ?? "Edit" },
        ]}
      />
      <h1 className="headline-md text-on-surface">Edit Product</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {product && <ProductForm product={product} />}
    </div>
  );
}
