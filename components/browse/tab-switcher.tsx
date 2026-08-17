"use client";

import { DEFAULT_COURSE_SORT, DEFAULT_PROFESSOR_SORT } from "@/lib/browse/params";
import { useBrowseParams } from "./use-browse-params";

const TABS = [
  { value: "courses", label: "Courses" },
  { value: "professors", label: "Professors" },
] as const;

export function TabSwitcher() {
  const { params, updateParams } = useBrowseParams();

  return (
    <div className="font-num flex border border-border text-xs uppercase tracking-wider" role="tablist">
      {TABS.map((tab) => {
        const active = params.tab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() =>
              updateParams({
                tab: tab.value,
                sort: tab.value === "courses" ? DEFAULT_COURSE_SORT : DEFAULT_PROFESSOR_SORT,
                dir: "asc",
              })
            }
            className={`px-4 py-2 transition-colors ${
              active ? "bg-accent text-accent-contrast" : "text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
