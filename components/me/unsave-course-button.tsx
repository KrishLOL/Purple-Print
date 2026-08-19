"use client";

import { useTransition } from "react";
import { unsaveCourse } from "@/app/me/actions";

export function UnsaveCourseButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => unsaveCourse(courseId))}
      className="text-xs text-text-muted underline underline-offset-4 disabled:opacity-50"
    >
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}
