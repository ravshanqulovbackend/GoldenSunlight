"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center px-margin-mobile py-24">
      <ErrorState
        title="Something went wrong"
        description="Try reloading the page. If the problem persists, please try again shortly."
        onRetry={reset}
      />
    </main>
  );
}
