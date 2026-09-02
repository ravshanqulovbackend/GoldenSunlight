"use client";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: "Products", href: "/admin/products" }, { label: "New Product" }]} />
      <h1 className="headline-md text-on-surface">New Product</h1>
      <ProductForm />
    </div>
  );
}
