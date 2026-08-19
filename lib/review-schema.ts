import { z } from "zod";

export const TERM_VALUES = ["FALL", "WINTER", "SUMMER"] as const;
export const GRADE_VALUES = ["A", "B", "C", "D", "F", "PREFER_NOT_TO_SAY"] as const;

const currentYear = new Date().getFullYear();

/**
 * Shared between the /review/new wizard (validating one step/object at a
 * time in the browser) and the submitReview server action (validating the
 * final payload again — never trust the client).
 */
export const reviewFormSchema = z
  .object({
    courseId: z.string().min(1, "Pick a course"),
    professorId: z.string().nullable(),
    termTaken: z.enum(TERM_VALUES, { message: "Pick a term" }),
    yearTaken: z
      .number()
      .int()
      .min(2015, "That year looks too far back")
      .max(currentYear + 1, "That year is in the future"),
    useful: z.number().int().min(1).max(5),
    easy: z.number().int().min(1).max(5),
    liked: z.boolean(),
    workloadHours: z.number().int().min(0, "Workload can't be negative").max(80, "That's more hours than a week has"),
    clarity: z.number().int().min(1).max(5).nullable(),
    helpfulness: z.number().int().min(1).max(5).nullable(),
    wouldRetake: z.boolean().nullable(),
    gradeReceived: z.enum(GRADE_VALUES, { message: "Pick a grade, or “prefer not to say”" }),
    body: z
      .string()
      .min(30, "Say a bit more — at least 30 characters")
      .max(2000, "Keep it under 2000 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.professorId) {
      if (data.clarity == null) {
        ctx.addIssue({ code: "custom", path: ["clarity"], message: "Rate clarity for this professor" });
      }
      if (data.helpfulness == null) {
        ctx.addIssue({ code: "custom", path: ["helpfulness"], message: "Rate helpfulness for this professor" });
      }
      if (data.wouldRetake == null) {
        ctx.addIssue({ code: "custom", path: ["wouldRetake"], message: "Say whether you'd retake with them" });
      }
    }
  });

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const REVIEW_DRAFT_STORAGE_KEY = "weu-review-draft";
