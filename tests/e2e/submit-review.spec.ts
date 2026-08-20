import { test, expect } from "@playwright/test";
import { cleanupTestUsers, createAuthenticatedContext, TEST_EMAIL_PREFIX } from "./helpers/auth";
import { query, recomputeCourseAggregates } from "./helpers/db";

const TEST_COURSE_CODE = "CBE 2224A/B"; // a course unlikely to already be reviewed by this test user

test.describe("submitting a review", () => {
  test.beforeAll(async () => {
    await cleanupTestUsers();
  });

  test.afterAll(async () => {
    const [course] = await query<{ id: string }>(`SELECT id FROM "Course" WHERE code = $1`, [TEST_COURSE_CODE]);
    await cleanupTestUsers();
    if (course) await recomputeCourseAggregates(course.id);
    // Not closing the pool: db.ts's pool is a module-level singleton shared
    // by every spec file in this single worker process, and Playwright exits
    // the process when the run finishes anyway.
  });

  test("updates the course's aggregates without a page rebuild", async ({ browser }) => {
    const [course] = await query<{ id: string; reviewCount: number }>(
      `SELECT id, "reviewCount" FROM "Course" WHERE code = $1`,
      [TEST_COURSE_CODE],
    );

    const context = await createAuthenticatedContext(browser, `${TEST_EMAIL_PREFIX}reviewer@uwo.ca`);
    const page = await context.newPage();

    await page.goto(`/review/new?course=${encodeURIComponent(TEST_COURSE_CODE)}`);

    // Step 1: course (preselected via query param) -> Next
    await page.getByRole("button", { name: "Next", exact: true }).click();
    // Step 2: no professor
    await page.getByRole("button", { name: /No professor/ }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    // Step 3: term + year
    await page.getByRole("button", { name: "Fall" }).click();
    await page.getByRole("button", { name: String(new Date().getFullYear()), exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    // Step 4: ratings
    await page.getByRole("button", { name: "Yes" }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    // Step 5: write + grade
    await page.getByPlaceholder(/What should someone picking this course know/).fill(
      "Playwright e2e test review: the pacing was reasonable and the assignments were clear enough to follow.",
    );
    await page.getByRole("button", { name: "A", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    // Step 6: submit
    await page.getByRole("button", { name: "Submit review" }).click();

    await expect(page).toHaveURL(new RegExp(`/course/${encodeURIComponent(TEST_COURSE_CODE)}`));

    const [after] = await query<{ reviewCount: number }>(`SELECT "reviewCount" FROM "Course" WHERE id = $1`, [
      course.id,
    ]);
    expect(after.reviewCount).toBe(course.reviewCount + 1);

    await context.close();
  });
});
