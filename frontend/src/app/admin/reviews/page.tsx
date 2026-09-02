"use client";

import { useState } from "react";
import Link from "next/link";
import { useReviews, useDeleteReview } from "@/lib/query/hooks/useReviews";
import { formatDate } from "@/lib/utils/money";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { AdminReview } from "@/types/review";

const PAGE_SIZE = 12;

const DEFAULT_ORDERING = "-created_at";

const SORT_OPTIONS = [
  { value: "product__name", label: "By Product" },
  { value: "-rating", label: "By Rating" },
  { value: DEFAULT_ORDERING, label: "By Date" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon key={star} name="star" filled={star <= rating} className="text-[16px] text-secondary" />
      ))}
    </div>
  );
}

function DeleteReviewButton({ review }: { review: AdminReview }) {
  const [confirming, setConfirming] = useState(false);
  const deleteReview = useDeleteReview();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="danger" disabled={deleteReview.isPending} onClick={() => deleteReview.mutate(review.id)}>
          Yes, delete
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label="Delete"
      className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
    >
      <Icon name="delete" className="text-[18px]" />
    </button>
  );
}

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [ordering, setOrdering] = useState(DEFAULT_ORDERING);

  const { data, isLoading, isError, refetch } = useReviews({ page, search: search || undefined, ordering });
  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-md text-on-surface">Reviews</h1>
        <p className="body-md text-on-surface-variant">{data ? `${data.count} reviews` : ""}</p>
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
            placeholder="Search by product, user, or text..."
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
      {data && data.results.length === 0 && <EmptyState icon="rate_review" title="No reviews found" />}

      {data && data.results.length > 0 && (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>Product</Th>
                <Th>User</Th>
                <Th>Rating</Th>
                <Th>Review</Th>
                <Th>Date</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.results.map((review) => (
                <Tr key={review.id}>
                  <Td>
                    <Link href={`/products/${review.product_slug}`} target="_blank" className="text-primary hover:underline">
                      {review.product_name}
                    </Link>
                  </Td>
                  <Td className="text-on-surface-variant">
                    {review.user_name || review.username}
                  </Td>
                  <Td>
                    <Stars rating={review.rating} />
                  </Td>
                  <Td className="max-w-xs truncate text-on-surface-variant" title={review.comment}>
                    {review.comment || "—"}
                  </Td>
                  <Td className="text-on-surface-variant">{formatDate(review.created_at)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <DeleteReviewButton review={review} />
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
