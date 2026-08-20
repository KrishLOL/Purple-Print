import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review guidelines",
  description: "What makes a fair, useful review on Western Eng Insider.",
};

const DOS = [
  "Critique the teaching: pacing, clarity, workload, how exams matched the material.",
  "Describe what actually happened in the course — assignments, grading, format.",
  "Give context: term taken, whether you'd recommend it, what would've helped you going in.",
  "Disagree with a grade or a policy by describing the policy, not the person who enforced it.",
];

const DONTS = [
  "No allegations of misconduct — harassment, discrimination, or anything else alleged but unproven belongs with the university, not a review.",
  "No personal details about a professor: appearance, health, family, or anything unrelated to teaching.",
  "No grade complaints about individuals — \"I got a B and think I deserved an A\" isn't teaching feedback.",
  "No names of other students, TAs, or anyone besides the course and the professor you selected.",
];

function List({ items, tone }: { items: string[]; tone: "good" | "bad" }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm text-text">
          <span
            className={`font-num mt-0.5 shrink-0 ${tone === "good" ? "text-good" : "text-bad"}`}
            aria-hidden
          >
            {tone === "good" ? "✓" : "✕"}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function GuidelinesPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">Review guidelines</h1>
      <p className="mt-2 text-sm text-text-muted">
        Reviews here are anonymous and public. That&rsquo;s useful for honest feedback, and it&rsquo;s
        also why the line is simple: critique the teaching, not the person.
      </p>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-good">Write this</h2>
        <List items={DOS} tone="good" />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-bad">Not this</h2>
        <List items={DONTS} tone="bad" />
      </section>

      <section className="mt-8 border-t border-border pt-6 text-sm text-text-muted">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">How moderation works</h2>
        <p>
          New reviews are automatically screened before publishing. Reviews naming a professor
          alongside a serious allegation, or matching a profanity/slur filter, are held for a
          moderator to look at instead of publishing immediately. Any review reported three or
          more times is automatically hidden pending review.
        </p>
        <p className="mt-3">
          Think a review about you is inaccurate? Every professor page has a &ldquo;Request a
          correction&rdquo; and &ldquo;Report an inaccurate review&rdquo; link.
        </p>
      </section>
    </main>
  );
}
