"use client";

import { useState, useTransition } from "react";
import { reportReview } from "./report-action";

const REASONS: { value: string; label: string }[] = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "DEFAMATION", label: "Defamation / false allegation" },
  { value: "PERSONAL_INFO", label: "Personal information" },
  { value: "OFF_TOPIC", label: "Off topic" },
  { value: "OTHER", label: "Other" },
];

export function ReportReviewButton({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (result) {
    return <span className="text-xs text-text-muted">{result.message}</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-text-muted underline underline-offset-4 hover:text-text"
      >
        Report
      </button>
    );
  }

  return (
    <div className="w-full border border-border bg-bg p-3 text-xs">
      <p className="mb-2 uppercase tracking-wider text-text-muted">Report this review</p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mb-2 w-full border border-border bg-surface px-2 py-1 text-text focus:border-accent focus:outline-none"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Optional details"
        rows={2}
        className="mb-2 w-full border border-border bg-surface px-2 py-1 text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await reportReview(reviewId, reason as never, details);
              setResult(
                res.ok
                  ? { ok: true, message: "Reported — thanks." }
                  : { ok: false, message: res.error },
              );
            })
          }
          className="border border-accent bg-accent px-2 py-1 text-accent-contrast disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Submit report"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-text-muted hover:text-text">
          Cancel
        </button>
      </div>
    </div>
  );
}
