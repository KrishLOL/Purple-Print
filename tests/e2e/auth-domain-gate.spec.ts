import { test, expect } from "@playwright/test";
import { pool } from "./helpers/db";

test.describe("domain gate", () => {
  test("a non-uwo.ca email is rejected immediately, with no code ever generated", async ({ page }) => {
    const badEmail = `troll-test-${Date.now()}@gmail.com`;

    await page.goto("/auth/signin");
    await page.getByLabel("Email").fill(badEmail);
    await page.getByRole("button", { name: "Send sign-in code" }).click();

    // Regression test: signIn() with redirect:false doesn't throw when the
    // signIn callback in auth.ts rejects a domain -- it returns the
    // callback's redirect URL as a plain string instead. That return value
    // must be checked explicitly, or a rejected email silently lands on the
    // "we sent you a code" screen despite nothing having been sent.
    await expect(page).toHaveURL(/\/auth\/error/);
    await expect(page.getByText("Only @uwo.ca email addresses")).toBeVisible();

    const { rows: codes } = await pool.query(`SELECT * FROM "SignInCode" WHERE email = $1`, [badEmail]);
    expect(codes).toHaveLength(0);

    const { rows: users } = await pool.query(`SELECT * FROM "User" WHERE email = $1`, [badEmail]);
    expect(users).toHaveLength(0);
  });
});
