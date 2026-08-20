import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { completeOnboarding, skipOnboarding } from "./actions";

export const metadata: Metadata = { title: "Welcome" };

const currentYear = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 8 }, (_, i) => currentYear + 1 - 1 + i);

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const disciplines = await prisma.discipline.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-sm flex-1 px-4 py-16 sm:px-8">
      <h1 className="text-2xl font-semibold">Welcome to Purpleprint</h1>
      <p className="mt-2 text-sm text-text-muted">
        Tell us your discipline and grad year so reviews you write can be attributed like
        &ldquo;Mechanical Eng., Class of &apos;27&rdquo; — never your name. Optional, and you can
        skip this.
      </p>

      <form action={completeOnboarding} className="mt-6 space-y-4">
        <div>
          <label htmlFor="disciplineId" className="mb-1.5 block text-xs uppercase tracking-wider text-text-muted">
            Discipline
          </label>
          <select
            id="disciplineId"
            name="disciplineId"
            className="w-full border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
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
          <select
            id="gradYear"
            name="gradYear"
            className="w-full border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          >
            <option value="">Prefer not to say</option>
            {GRAD_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button formAction={skipOnboarding} variant="ghost">
            Skip
          </Button>
        </div>
      </form>
    </main>
  );
}
