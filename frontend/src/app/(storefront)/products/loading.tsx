import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="mt-4 h-10 w-80" />
      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <Skeleton className="h-96 w-full md:w-64" />
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
