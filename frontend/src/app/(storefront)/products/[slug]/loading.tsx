import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Skeleton className="h-5 w-56" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <Skeleton className="aspect-square lg:col-span-7" />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
