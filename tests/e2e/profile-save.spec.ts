import { test, expect } from "@playwright/test";
import { cleanupTestUsers, createAuthenticatedContext, TEST_EMAIL_PREFIX } from "./helpers/auth";
import { pool } from "./helpers/db";

test.describe("profile save", () => {
  test.beforeAll(async () => {
    await cleanupTestUsers();
  });

  test.afterAll(async () => {
    await cleanupTestUsers();
  });

  test("saving a discipline shows confirmation and persists to the database", async ({ browser }) => {
    const email = `${TEST_EMAIL_PREFIX}profile@uwo.ca`;
    const context = await createAuthenticatedContext(browser, email);
    const page = await context.newPage();

    await page.goto("/me");
    const [{ id: disciplineId }] = (
      await pool.query<{ id: string }>(`SELECT id FROM "Discipline" WHERE slug = 'mechanical'`)
    ).rows;

    await page.selectOption("#disciplineId", disciplineId);
    await page.getByRole("button", { name: "Save" }).click();

    // The form previously gave no feedback at all on submit -- a plain
    // page re-render with no loading/success state made a genuinely
    // successful save look like it had silently failed. Confirmed
    // directly against the database that saves were working all along;
    // this is the fix for that missing feedback, not the underlying save.
    await expect(page.getByText("Saved.")).toBeVisible({ timeout: 10000 });

    const { rows } = await pool.query(`SELECT "disciplineId" FROM "User" WHERE email = $1`, [email]);
    expect(rows[0].disciplineId).toBe(disciplineId);

    await context.close();
  });
});
