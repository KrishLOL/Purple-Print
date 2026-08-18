import type { GradeBucket } from "@/app/generated/prisma/client";

export type HistogramBucket = { label: string; count: number };

const WORKLOAD_BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: "0-3", min: 0, max: 3 },
  { label: "4-6", min: 4, max: 6 },
  { label: "7-9", min: 7, max: 9 },
  { label: "10-12", min: 10, max: 12 },
  { label: "13-15", min: 13, max: 15 },
  { label: "16+", min: 16, max: Infinity },
];

export function bucketWorkload(hoursList: number[]): HistogramBucket[] {
  return WORKLOAD_BUCKETS.map(({ label, min, max }) => ({
    label,
    count: hoursList.filter((h) => h >= min && h <= max).length,
  }));
}

const GRADE_LABELS: Record<GradeBucket, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  F: "F",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

const GRADE_ORDER: GradeBucket[] = ["A", "B", "C", "D", "F", "PREFER_NOT_TO_SAY"];

export function bucketGrades(grades: GradeBucket[]): HistogramBucket[] {
  return GRADE_ORDER.map((grade) => ({
    label: GRADE_LABELS[grade],
    count: grades.filter((g) => g === grade).length,
  }));
}
