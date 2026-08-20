import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { cleanupTestUsers, createAuthenticatedContext, createTestUser, TEST_EMAIL_PREFIX } from "./helpers/auth";
import { query } from "./helpers/db";

test.describe("reporting a review", () => {
  test.beforeAll(async () => {
    await cleanupTestUsers();
  });

  test.afterAll(async () => {
    await cleanupTestUsers();
    // Not closing the pool: db.ts's pool is a module-level singleton shared
    // by every spec file in this single worker process, and Playwright exits
    // the process when the run finishes anyway.
  });

  test("three reports hides the review and puts it in the mod queue", async ({ browser }) => {
    // Seed a fresh PUBLISHED review from a throwaway author so this test
    // doesn't depend on — or disturb — any specific seeded review.
    const [course] = await query<{ id: string; code: string }>(
      `SELECT id, code FROM "Course" WHERE "isSeedData" = true LIMIT 1`,
    );
    const author = await createTestUser(`${TEST_EMAIL_PREFIX}author@uwo.ca`);

    const reviewId = randomUUID();
    const body = "Playwright e2e test review created specifically to be reported three times.";
    await query(
      `INSERT INTO "Review"
         (id, "userId", "courseId", "termTaken", "yearTaken", useful, easy, liked, "workloadHours",
          "gradeReceived", body, status, "isSeedData", "createdAt")
       VALUES ($1, $2, $3, 'FALL', $4, 3, 3, true, 5, 'PREFER_NOT_TO_SAY', $5, 'PUBLISHED', false, now())`,
      [reviewId, author.id, course.id, new Date().getFullYear(), body],
    );

    const mod = await createAuthenticatedContext(browser, `${TEST_EMAIL_PREFIX}mod@uwo.ca`, "MOD");
    const reporters = await Promise.all(
      [1, 2, 3].map((n) => createAuthenticatedContext(browser, `${TEST_EMAIL_PREFIX}reporter${n}@uwo.ca`)),
    );

    for (const [i, context] of reporters.entries()) {
      const page = await context.newPage();
      await page.goto(`/course/${encodeURIComponent(course.code)}`);
      const card = page.locator("article", { hasText: body });
      await card.getByRole("button", { name: "Report" }).click();
      await card.getByRole("button", { name: "Submit report" }).click();
      await expect(card.getByText("Reported")).toBeVisible();

      // Neon's read path can lag a committed write by up to ~1-2s, so poll
      // rather than reading once.
      let current: { reportCount: number; status: string } | undefined;
      await expect
        .poll(
          async () => {
            [current] = await query<{ reportCount: number; status: string }>(
              `SELECT "reportCount", status FROM "Review" WHERE id = $1`,
              [reviewId],
            );
            return current?.reportCount;
          },
          { timeout: 5000 },
        )
        .toBe(i + 1);
      expect(current?.status).toBe(i < 2 ? "PUBLISHED" : "PENDING");

      await page.close();
    }

    // Hidden from the public course page now.
    const modPage = await mod.newPage();
    await modPage.goto(`/course/${encodeURIComponent(course.code)}`);
    await expect(modPage.locator("article", { hasText: body })).toHaveCount(0);

    // ...and shows up in the mod queue.
    await modPage.goto("/admin/moderation");
    await expect(modPage.locator("div", { hasText: body }).first()).toBeVisible();

    for (const context of [...reporters, mod]) await context.close();
  });
});
