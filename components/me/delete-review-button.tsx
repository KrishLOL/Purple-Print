"use client";

import { useTransition } from "react";
import { deleteMyReview } from "@/app/me/actions";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Delete this review permanently?")) return;
        startTransition(() => deleteMyReview(reviewId));
      }}
      className="text-xs text-bad underline underline-offset-4 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
