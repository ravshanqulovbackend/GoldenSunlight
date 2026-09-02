"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function ProductDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-container-max-width px-margin-mobile py-10 md:px-margin-desktop">
      <ErrorState
        title="Failed to load product"
        description="Refresh the page and try again."
        onRetry={reset}
      />
    </div>
  );
}
