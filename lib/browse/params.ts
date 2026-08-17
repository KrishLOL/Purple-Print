import { z } from "zod";

export const TERM_VALUES = ["FALL", "WINTER", "SUMMER"] as const;
export const COURSE_TYPE_VALUES = ["all", "core", "elective"] as const;
export const COURSE_SORT_KEYS = [
  "code",
  "title",
  "reviewCount",
  "useful",
  "easy",
  "liked",
  "workload",
] as const;
export const PROFESSOR_SORT_KEYS = [
  "lastName",
  "reviewCount",
  "clarity",
  "helpfulness",
  "retake",
] as const;
export const SORT_DIRS = ["asc", "desc"] as const;

export type CourseSortKey = (typeof COURSE_SORT_KEYS)[number];
export type ProfessorSortKey = (typeof PROFESSOR_SORT_KEYS)[number];
export type SortDir = (typeof SORT_DIRS)[number];

/** Rating columns get the "not enough reviews sinks to the bottom" + Bayesian-ranking treatment. */
export const COURSE_RATING_SORT_KEYS: CourseSortKey[] = ["useful", "easy", "liked"];
export const PROFESSOR_RATING_SORT_KEYS: ProfessorSortKey[] = ["clarity", "helpfulness", "retake"];

export const DEFAULT_COURSE_SORT: CourseSortKey = "code";
export const DEFAULT_PROFESSOR_SORT: ProfessorSortKey = "lastName";

const csv = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((val) => {
    if (typeof val !== "string" || val.trim() === "") return [];
    return val.split(",").filter(Boolean);
  }, z.array(item));

const rawSchema = z.object({
  tab: z.enum(["courses", "professors"]).catch("courses"),
  q: z.string().catch(""),
  discipline: csv(z.string()).catch([]),
  year: csv(z.coerce.number().int().min(1).max(4)).catch([]),
  term: csv(z.enum(TERM_VALUES)).catch([]),
  type: z.enum(COURSE_TYPE_VALUES).catch("all"),
  minReviews: z.coerce.number().int().min(0).max(1000).catch(0),
  sort: z.string().catch(""),
  dir: z.enum(SORT_DIRS).catch("asc"),
});

export type BrowseParams = {
  tab: "courses" | "professors";
  q: string;
  discipline: string[];
  year: number[];
  term: (typeof TERM_VALUES)[number][];
  type: (typeof COURSE_TYPE_VALUES)[number];
  minReviews: number;
  sort: CourseSortKey | ProfessorSortKey;
  dir: SortDir;
};

/** Turns raw Next.js `searchParams` into a fully-defaulted, validated filter/sort state. */
export function parseBrowseParams(
  raw: Record<string, string | string[] | undefined>,
): BrowseParams {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) flat[key] = value[0] ?? "";
    else if (value !== undefined) flat[key] = value;
  }

  const parsed = rawSchema.parse(flat);
  const allowedSorts = parsed.tab === "courses" ? COURSE_SORT_KEYS : PROFESSOR_SORT_KEYS;
  const fallbackSort = parsed.tab === "courses" ? DEFAULT_COURSE_SORT : DEFAULT_PROFESSOR_SORT;
  const sort = (allowedSorts as readonly string[]).includes(parsed.sort)
    ? (parsed.sort as CourseSortKey | ProfessorSortKey)
    : fallbackSort;

  return { ...parsed, sort };
}

const DEFAULTS: Omit<BrowseParams, "sort"> = {
  tab: "courses",
  q: "",
  discipline: [],
  year: [],
  term: [],
  type: "all",
  minReviews: 0,
  dir: "asc",
};

/** Serializes only the non-default fields, so URLs stay clean and shareable. */
export function browseParamsToSearchString(params: BrowseParams): string {
  const search = new URLSearchParams();
  const fallbackSort = params.tab === "courses" ? DEFAULT_COURSE_SORT : DEFAULT_PROFESSOR_SORT;

  if (params.tab !== DEFAULTS.tab) search.set("tab", params.tab);
  if (params.q !== DEFAULTS.q) search.set("q", params.q);
  if (params.discipline.length > 0) search.set("discipline", params.discipline.join(","));
  if (params.year.length > 0) search.set("year", params.year.join(","));
  if (params.term.length > 0) search.set("term", params.term.join(","));
  if (params.type !== DEFAULTS.type) search.set("type", params.type);
  if (params.minReviews !== DEFAULTS.minReviews) search.set("minReviews", String(params.minReviews));
  if (params.sort !== fallbackSort) search.set("sort", params.sort);
  if (params.dir !== DEFAULTS.dir) search.set("dir", params.dir);

  const str = search.toString();
  return str ? `?${str}` : "";
}
