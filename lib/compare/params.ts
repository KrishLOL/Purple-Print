import { z } from "zod";

export const COMPARE_TYPES = ["courses", "professors"] as const;
export const MAX_COMPARE_ITEMS = 4;
export const MIN_COMPARE_ITEMS = 2;

const idsSchema = z.preprocess((val) => {
  if (typeof val !== "string" || !val.trim()) return [];
  return [...new Set(val.split(",").filter(Boolean))].slice(0, MAX_COMPARE_ITEMS);
}, z.array(z.string()));

const rawSchema = z.object({
  type: z.enum(COMPARE_TYPES).catch("courses"),
  ids: idsSchema.catch([]),
});

export type CompareParams = { type: (typeof COMPARE_TYPES)[number]; ids: string[] };

export function parseCompareParams(raw: Record<string, string | string[] | undefined>): CompareParams {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) flat[key] = value[0] ?? "";
    else if (value !== undefined) flat[key] = value;
  }
  return rawSchema.parse(flat);
}

export function compareParamsToSearchString(params: CompareParams): string {
  const search = new URLSearchParams();
  if (params.type !== "courses") search.set("type", params.type);
  if (params.ids.length > 0) search.set("ids", params.ids.join(","));
  const str = search.toString();
  return str ? `?${str}` : "";
}
