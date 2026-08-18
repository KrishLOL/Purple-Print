import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { CornerCard } from "@/components/ui/corner-card";
import { Button } from "@/components/ui/button";
import { SegmentedBar } from "@/components/ui/segmented-bar";
import { MetricDial } from "@/components/ui/metric-dial";
import { BarHistogram } from "@/components/ui/bar-histogram";
import { DisciplineBadge } from "@/components/discipline-badge";
import { GLYPHS } from "@/components/glyphs";

export const metadata: Metadata = {
  title: "Styleguide",
};

const PALETTE: Array<{ name: string; varName: string; note: string }> = [
  { name: "Ink", varName: "--ink", note: "page background (dark)" },
  { name: "Paper", varName: "--paper", note: "page background (light)" },
  { name: "Graphite", varName: "--graphite", note: "card surface (dark)" },
  { name: "Rule", varName: "--rule", note: "hairline grid / borders" },
  { name: "Purple", varName: "--purple", note: "Western purple — accents only" },
  { name: "Purple Lit", varName: "--purple-lit", note: "readable purple on dark" },
  { name: "Signal", varName: "--signal", note: "highlight / active state" },
  { name: "Good", varName: "--good", note: "positive signal" },
  { name: "Warn", varName: "--warn", note: "caution signal" },
  { name: "Bad", varName: "--bad", note: "negative signal" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-10">
      <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-text-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-8">
      <header className="flex items-center justify-between border-b border-border py-8">
        <div>
          <p className="font-num text-xs uppercase tracking-[0.2em] text-text-muted">
            Western Eng Insider
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Styleguide</h1>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Palette">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PALETTE.map((c) => (
            <div key={c.varName} className="border border-border">
              <div className="h-16 w-full" style={{ background: `var(${c.varName})` }} />
              <div className="p-3">
                <p className="text-sm">{c.name}</p>
                <p className="font-num text-xs text-text-muted">{c.varName}</p>
                <p className="mt-1 text-xs text-text-muted">{c.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold">Heading / Space Grotesk</h1>
          <h2 className="text-2xl font-semibold">Section heading</h2>
          <h3 className="text-lg font-semibold">Card heading</h3>
          <p className="max-w-prose text-sm text-text">
            Body copy runs in Inter. It needs to stay comfortably readable across a 30-2000
            character review, so headings carry the distinct geometric personality and body
            text stays quiet and legible.
          </p>
          <p className="font-num text-sm text-text-muted">
            Course codes, table data, and every number on this site render in mono: ES 1036A/B ·
            CS 1026A · 87% · 4.2 / 5.0
          </p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Write a review</Button>
          <Button variant="secondary">Compare</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Corner-bracket card">
        <div className="grid gap-4 sm:grid-cols-2">
          <CornerCard>
            <p className="font-num text-xs uppercase tracking-wider text-text-muted">
              ES 1036A/B
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              Programming Fundamentals for Engineers
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Registration-mark corners instead of a drop shadow.
            </p>
          </CornerCard>
          <CornerCard>
            <p className="text-sm text-text-muted">Any content can sit inside a CornerCard.</p>
          </CornerCard>
        </div>
      </Section>

      <Section title="Segmented bars">
        <div className="max-w-sm space-y-6">
          <SegmentedBar label="Useful" percent={82} />
          <SegmentedBar label="Easy" percent={41} tone="warn" />
          <SegmentedBar label="Liked" percent={95} tone="good" />
          <SegmentedBar label="Not enough ratings" percent={null} />
        </div>
      </Section>

      <Section title="Metric dials">
        <div className="flex flex-wrap justify-center gap-8">
          <MetricDial label="Useful" value={82} sampleSize={12} tone="accent" />
          <MetricDial label="Easy" value={41} sampleSize={12} tone="warn" />
          <MetricDial label="Liked" value={95} sampleSize={12} tone="good" />
          <MetricDial label="Not enough ratings" value={null} sampleSize={1} />
        </div>
      </Section>

      <Section title="Bar histogram">
        <div className="max-w-sm">
          <BarHistogram
            buckets={[
              { label: "0-3", count: 2 },
              { label: "4-6", count: 8 },
              { label: "7-9", count: 5 },
              { label: "10-12", count: 3 },
              { label: "13+", count: 1 },
            ]}
          />
        </div>
      </Section>

      <Section title="Discipline glyphs & badges">
        <div className="mb-6 flex flex-wrap gap-3">
          <DisciplineBadge name="Mechanical Engineering" colorAccent="#F472B6" glyphKey="gear" />
          <DisciplineBadge name="Software Engineering" colorAccent="#C084FC" glyphKey="bracket" />
          <DisciplineBadge name="Civil Engineering" colorAccent="#EA580C" glyphKey="truss" />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-9">
          {Object.entries(GLYPHS).map(([key, Glyph]) => (
            <div key={key} className="flex flex-col items-center gap-1 border border-border p-3">
              <Glyph className="h-5 w-5" />
              <span className="font-num text-[10px] text-text-muted">{key}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Blueprint grid">
        <p className="max-w-prose text-sm text-text-muted">
          The faint 8px grid behind this page is the site-wide background — see{" "}
          <code className="font-num">.blueprint-grid</code> in{" "}
          <code className="font-num">app/globals.css</code>.
        </p>
      </Section>
    </main>
  );
}
