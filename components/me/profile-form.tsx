"use client";

import { useState, useTransition } from "react";
import { updateMyProfile } from "@/app/me/actions";
import { Button } from "@/components/ui/button";

export function ProfileForm({
  disciplines,
  currentDisciplineId,
  currentGradYear,
}: {
  disciplines: { id: string; name: string }[];
  currentDisciplineId: string | null;
  currentGradYear: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function submit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateMyProfile(formData);
      setSaved(true);
    });
  }

  return (
    <form action={submit} className="flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="disciplineId" className="mb-1.5 block text-xs uppercase tracking-wider text-text-muted">
          Discipline
        </label>
        <select
          id="disciplineId"
          name="disciplineId"
          defaultValue={currentDisciplineId ?? ""}
          onChange={() => setSaved(false)}
          className="border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        >
          <option value="">Prefer not to say</option>
          {disciplines.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="gradYear" className="mb-1.5 block text-xs uppercase tracking-wider text-text-muted">
          Grad year
        </label>
        <input
          id="gradYear"
          name="gradYear"
          type="number"
          defaultValue={currentGradYear ?? ""}
          onChange={() => setSaved(false)}
          placeholder="2027"
          className="w-28 border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
        />
      </div>
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
      {saved && !isPending && <span className="text-xs text-good">Saved.</span>}
    </form>
  );
}
