"use client";

import { useState } from "react";
import { DisciplineCard } from "@/components/home/discipline-card";
import { CornerCard } from "@/components/ui/corner-card";
import type { DisciplineSummary } from "@/lib/landing";

const TABS = [
  { value: "core", label: "Disciplines" },
  { value: "combined", label: "Double Degree Programs" },
] as const;

export function DisciplineTabs({
  coreDisciplines,
  combinedDegreeDisciplines,
}: {
  coreDisciplines: DisciplineSummary[];
  combinedDegreeDisciplines: DisciplineSummary[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("core");

  return (
    <div>
      <div className="font-num mb-6 flex border border-border text-xs uppercase tracking-wider" role="tablist">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 transition-colors ${
                active ? "bg-accent text-accent-contrast" : "text-text-muted hover:text-text"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "core" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {coreDisciplines.map((d) => (
            <DisciplineCard key={d.slug} discipline={d} />
          ))}
        </div>
      )}

      {tab === "combined" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {combinedDegreeDisciplines.map((d) => (
            <DisciplineCard key={d.slug} discipline={d} />
          ))}
          <CornerCard className="col-span-2 sm:col-span-1">
            <h3 className="text-sm font-semibold">HBA (Ivey Combined Degree)</h3>
            <p className="mt-2 text-xs text-text-muted">
              Combined with Chemical, Civil, Electrical, Integrated, Mechanical, Mechatronics, or
              Software Engineering. No dedicated engineering course codes of its own — students
              take their base discipline&rsquo;s normal courses plus Ivey&rsquo;s HBA curriculum, so
              there&rsquo;s nothing separate to browse here.
            </p>
          </CornerCard>
        </div>
      )}
    </div>
  );
}
