"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/browse${qs}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search courses, professors, or topics"
        className="w-full border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="font-num shrink-0 border border-accent bg-accent px-5 py-3 text-xs uppercase tracking-wider text-accent-contrast hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
