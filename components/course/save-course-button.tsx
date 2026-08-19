"use client";

import { useState, useTransition } from "react";
import { toggleSavedCourse } from "@/app/course/[code]/save-action";

export function SaveCourseButton({
  courseId,
  initiallySaved,
}: {
  courseId: string;
  initiallySaved: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-pressed={saved}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleSavedCourse(courseId);
          setSaved(result.saved);
        })
      }
      className={`font-num border px-2.5 py-1 text-xs uppercase tracking-wider transition-colors disabled:opacity-50 ${
        saved
          ? "border-accent bg-accent text-accent-contrast"
          : "border-border text-text-muted hover:border-accent hover:text-text"
      }`}
    >
      {saved ? "Saved" : "Save course"}
    </button>
  );
}
