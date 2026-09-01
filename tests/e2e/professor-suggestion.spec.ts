import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { cleanupTestUsers, createAuthenticatedContext, TEST_EMAIL_PREFIX } from "./helpers/auth";
import { query } from "./helpers/db";

const SUGGESTED_NAME = "Zzz Testprof E2e";
const NORMALIZED_NAME = "zzz testprof e2e";

async function cleanupSuggestionArtifacts(courseId: string) {
  await query(`DELETE FROM "Review" WHERE "courseId" = $1 AND "suggestedProfessorName" = $2`, [
    courseId,
    SUGGESTED_NAME,
  ]);
  await query(`DELETE FROM "ProfessorSuggestion" WHERE "courseId" = $1 AND "normalizedName" = $2`, [
    courseId,
    NORMALIZED_NAME,
  ]);
  await query(
    `DELETE FROM "CourseProfessor" WHERE "professorId" IN
       (SELECT id FROM "Professor" WHERE "firstName" = 'Zzz Testprof' AND "lastName" = 'E2e')`,
  );
  await query(`DELETE FROM "Professor" WHERE "firstName" = 'Zzz Testprof' AND "lastName" = 'E2e'`);
}

// Two-word so splitDisplayName's naive split matches this fixture's actual
// firstName/lastName exactly -- see the "link existing professor" test.
const EXISTING_DISPLAY = "Zzz Existingprof";
const EXISTING_FIRST = "Zzz";
const EXISTING_LAST = "Existingprof";
const EXISTING_NORMALIZED = "zzz existingprof";

async function cleanupExistingProfessorArtifacts(targetCourseId: string) {
  await query(`DELETE FROM "Review" WHERE "courseId" = $1 AND "suggestedProfessorName" = $2`, [
    targetCourseId,
    EXISTING_DISPLAY,
  ]);
  await query(`DELETE FROM "ProfessorSuggestion" WHERE "courseId" = $1 AND "normalizedName" = $2`, [
    targetCourseId,
    EXISTING_NORMALIZED,
  ]);
  await query(
    `DELETE FROM "CourseProfessor" WHERE "professorId" IN
       (SELECT id FROM "Professor" WHERE "firstName" = $1 AND "lastName" = $2)`,
    [EXISTING_FIRST, EXISTING_LAST],
  );
  await query(`DELETE FROM "Professor" WHERE "firstName" = $1 AND "lastName" = $2`, [EXISTING_FIRST, EXISTING_LAST]);
}

async function submitOtherProfessorReview(
  browser: import("@playwright/test").Browser,
  email: string,
  courseCode: string,
  professorName: string,
) {
  const context = await createAuthenticatedContext(browser, email);
  const page = await context.newPage();

  await page.goto(`/review/new?course=${encodeURIComponent(courseCode)}`);
  // Step 1: course (preselected via query param) -> Next
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Step 2: Other -> type the name
  await page.getByRole("button", { name: /Other/ }).click();
  await page.getByPlaceholder("Professor's name").fill(professorName);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Step 3: term + year
  await page.getByRole("button", { name: "Fall" }).click();
  await page.getByRole("button", { name: String(new Date().getFullYear()), exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Step 4: ratings -- "Other" counts as having professor info, so both
  // Liked and Would-retake Yes/No groups render.
  await page.getByRole("button", { name: "Yes" }).first().click();
  await page.getByRole("button", { name: "Yes" }).nth(1).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Step 5: write + grade
  await page
    .getByPlaceholder(/What should someone picking this course know/)
    .fill("Playwright e2e test review: reasonable pacing and clear expectations throughout the term.");
  await page.getByRole("button", { name: "A", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // Step 6: submit
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page).toHaveURL(new RegExp(`/course/${encodeURIComponent(courseCode)}`));

  await context.close();
}

test.describe("professor suggestions", () => {
  test.beforeAll(async () => {
    await cleanupTestUsers();
  });

  test.afterAll(async () => {
    await cleanupTestUsers();
  });

  test("3 mentions of the same unlisted name queue a suggestion a moderator can promote", async ({ browser }) => {
    const [course] = await query<{ id: string; code: string }>(
      `SELECT id, code FROM "Course" WHERE "isSeedData" = true LIMIT 1`,
    );
    await cleanupSuggestionArtifacts(course.id);

    for (const n of [1, 2, 3]) {
      await submitOtherProfessorReview(browser, `${TEST_EMAIL_PREFIX}suggest${n}@uwo.ca`, course.code, SUGGESTED_NAME);
    }

    let suggestion: { id: string; mentioncount: number; status: string } | undefined;
    await expect
      .poll(
        async () => {
          [suggestion] = await query(
            `SELECT id, "mentionCount" as mentioncount, status FROM "ProfessorSuggestion"
             WHERE "courseId" = $1 AND "normalizedName" = $2`,
            [course.id, NORMALIZED_NAME],
          );
          return suggestion?.mentioncount;
        },
        { timeout: 5000 },
      )
      .toBe(3);
    expect(suggestion?.status).toBe("OPEN");

    // ...and shows up in the mod queue, ready to promote.
    const mod = await createAuthenticatedContext(browser, `${TEST_EMAIL_PREFIX}suggestmod@uwo.ca`, "MOD");
    const modPage = await mod.newPage();
    await modPage.goto("/admin/moderation");
    await expect(modPage.getByText(`“${SUGGESTED_NAME}” on ${course.code}`)).toBeVisible();
    await expect(modPage.getByText("Mentioned 3 times")).toBeVisible();

    await modPage.getByRole("button", { name: `Create & link "${SUGGESTED_NAME}"` }).click();

    await expect
      .poll(
        async () => {
          const [row] = await query<{ status: string }>(`SELECT status FROM "ProfessorSuggestion" WHERE id = $1`, [
            suggestion!.id,
          ]);
          return row?.status;
        },
        { timeout: 5000 },
      )
      .toBe("PROMOTED");

    const [professor] = await query<{ id: string; slug: string }>(
      `SELECT id, slug FROM "Professor" WHERE "firstName" = 'Zzz Testprof' AND "lastName" = 'E2e'`,
    );
    expect(professor).toBeTruthy();

    const [link] = await query(`SELECT id FROM "CourseProfessor" WHERE "courseId" = $1 AND "professorId" = $2`, [
      course.id,
      professor.id,
    ]);
    expect(link).toBeTruthy();

    // The 3 historical reviews that named this professor as free text get
    // backfilled onto the real Professor record.
    const [{ count }] = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM "Review" WHERE "courseId" = $1 AND "professorId" = $2`,
      [course.id, professor.id],
    );
    expect(Number(count)).toBe(3);

    await modPage.close();
    await mod.close();
    await cleanupSuggestionArtifacts(course.id);
  });

  test("promoting a suggestion links an existing professor by name instead of duplicating them", async ({
    browser,
  }) => {
    const [existingCourse, targetCourse] = await query<{ id: string; code: string }>(
      `SELECT id, code FROM "Course" WHERE "isSeedData" = true ORDER BY code LIMIT 2`,
    );
    await cleanupExistingProfessorArtifacts(targetCourse.id);

    // A professor who already exists in the catalog, linked to a different
    // course than the one students are about to suggest them on -- this is
    // the realistic case (their course-linkage is just incomplete), not a
    // brand new hire.
    const professorId = randomUUID();
    await query(
      `INSERT INTO "Professor" (id, "firstName", "lastName", slug, title, "isSeedData", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'Professor', false, now(), now())`,
      [professorId, EXISTING_FIRST, EXISTING_LAST, `zzz-existingprof-e2e-${professorId.slice(0, 8)}`],
    );
    await query(
      `INSERT INTO "CourseProfessor" (id, "courseId", "professorId") VALUES ($1, $2, $3)`,
      [randomUUID(), existingCourse.id, professorId],
    );

    for (const n of [1, 2, 3]) {
      await submitOtherProfessorReview(
        browser,
        `${TEST_EMAIL_PREFIX}existing${n}@uwo.ca`,
        targetCourse.code,
        EXISTING_DISPLAY,
      );
    }

    let suggestionId: string | undefined;
    await expect
      .poll(async () => {
        const [row] = await query<{ id: string; mentioncount: number }>(
          `SELECT id, "mentionCount" as mentioncount FROM "ProfessorSuggestion"
           WHERE "courseId" = $1 AND "normalizedName" = $2`,
          [targetCourse.id, EXISTING_NORMALIZED],
        );
        suggestionId = row?.id;
        return row?.mentioncount;
      }, { timeout: 5000 })
      .toBe(3);

    const mod = await createAuthenticatedContext(browser, `${TEST_EMAIL_PREFIX}existingmod@uwo.ca`, "MOD");
    const modPage = await mod.newPage();
    await modPage.goto("/admin/moderation");
    await modPage.getByRole("button", { name: `Create & link "${EXISTING_DISPLAY}"` }).click();

    await expect
      .poll(async () => {
        const [row] = await query<{ status: string }>(`SELECT status FROM "ProfessorSuggestion" WHERE id = $1`, [
          suggestionId,
        ]);
        return row?.status;
      }, { timeout: 5000 })
      .toBe("PROMOTED");

    // No duplicate Professor row -- the original one just got linked to the new course.
    const professors = await query<{ id: string }>(
      `SELECT id FROM "Professor" WHERE "firstName" = $1 AND "lastName" = $2`,
      [EXISTING_FIRST, EXISTING_LAST],
    );
    expect(professors).toHaveLength(1);
    expect(professors[0].id).toBe(professorId);

    const [link] = await query(`SELECT id FROM "CourseProfessor" WHERE "courseId" = $1 AND "professorId" = $2`, [
      targetCourse.id,
      professorId,
    ]);
    expect(link).toBeTruthy();

    const [logEntry] = await query<{ action: string }>(
      `SELECT action FROM "ModerationLog" WHERE "targetType" = 'Professor' AND "targetId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
      [professorId],
    );
    expect(logEntry.action).toBe("LINK_EXISTING_PROFESSOR");

    await modPage.close();
    await mod.close();
    await cleanupExistingProfessorArtifacts(targetCourse.id);
  });
});
