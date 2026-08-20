"use client";

import { useTransition } from "react";

export function ModActionButton({
  label,
  pendingLabel,
  tone = "default",
  confirmMessage,
  action,
}: {
  label: string;
  pendingLabel?: string;
  tone?: "default" | "good" | "bad";
  confirmMessage?: string;
  action: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const toneClass =
    tone === "good"
      ? "border-good text-good hover:bg-good hover:text-ink"
      : tone === "bad"
        ? "border-bad text-bad hover:bg-bad hover:text-ink"
        : "border-border text-text-muted hover:border-accent hover:text-text";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(action);
      }}
      className={`font-num border px-2.5 py-1 text-xs uppercase tracking-wider transition-colors disabled:opacity-50 ${toneClass}`}
    >
      {isPending ? (pendingLabel ?? "Working…") : label}
    </button>
  );
}
