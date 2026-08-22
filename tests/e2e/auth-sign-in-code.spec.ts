import { test, expect } from "@playwright/test";
import { pool } from "./helpers/db";

/**
 * Three link-based sign-in approaches (a plain magic link, one gated
 * behind a confirm-page click, then one behind an opaque id instead of a
 * `?url=` param) were each defeated in turn, confirmed live step by step
 * against the database, by whatever scans uwo.ca mail (Microsoft 365/
 * Defender): the real token was being consumed at mail-delivery time,
 * before the user had even opened the message, regardless of how the
 * link was shaped. A link is fundamentally the wrong primitive for an
 * inbox that scans everything reachable by an HTTP GET.
 *
 * This is the replacement: a 6-digit code, sent as plain text with no
 * link and nothing clickable, that the user types into
 * /auth/verify-code. The code only ever unlocks the real Auth.js
 * callback URL, fetched server-to-server (see verifySignInCode in
 * app/auth/actions.ts) with its session cookie relayed onto the
 * response -- never exposed to the user's browser or the email itself.
 *
 * These tests read the code via SignInCode.devCode, a dev/test-only
 * plaintext column (see its comment in schema.prisma) -- dev mode
 * already skips real email sending and logs the plaintext code instead,
 * so this doesn't add a new category of exposure, it just makes that
 * existing convenience something a test can read deterministically.
 */
async function getDevCode(email: string): Promise<string> {
  const { rows } = await pool.query<{ devCode: string }>(
    `SELECT "devCode" FROM "SignInCode" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1`,
    [email],
  );
  if (!rows[0]?.devCode) throw new Error(`No devCode found for ${email}`);
  return rows[0].devCode;
}

test.describe("sign-in code flow", () => {
  test("the correct code completes sign-in and the session persists on a fresh navigation", async ({ page }) => {
    const email = `signin-code-happy-${Date.now()}@uwo.ca`;

    await page.goto("/auth/signin");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send sign-in code" }).click();
    await page.waitForURL(/verify-code/, { timeout: 10000 });
    await expect(page.getByText(email)).toBeVisible();

    const code = await getDevCode(email);
    await page.locator('input[inputmode="numeric"]').fill(code);
    await page.getByRole("button", { name: "Confirm sign-in" }).click();

    await page.waitForURL((url) => !url.pathname.includes("/auth/verify-code"), { timeout: 10000 });
    await expect(page).not.toHaveURL(/\/auth\/error/);

    // The real proof: a fresh navigation (a genuinely new request, not
    // just wherever the last redirect happened to land) still recognizes
    // the session.
    await page.goto("/me");
    await expect(page).not.toHaveURL(/\/auth\/signin/);

    const { rows } = await pool.query(
      `SELECT s.id FROM "Session" s JOIN "User" u ON u.id = s."userId" WHERE u.email = $1`,
      [email],
    );
    expect(rows).toHaveLength(1);
  });

  test("a wrong code shows an error and never creates a session", async ({ page }) => {
    const email = `signin-code-wrong-${Date.now()}@uwo.ca`;

    await page.goto("/auth/signin");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send sign-in code" }).click();
    await page.waitForURL(/verify-code/, { timeout: 10000 });

    await page.locator('input[inputmode="numeric"]').fill("000000");
    await page.getByRole("button", { name: "Confirm sign-in" }).click();
    await expect(page.getByText(/incorrect code/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/verify-code/);

    const { rows } = await pool.query(
      `SELECT s.id FROM "Session" s JOIN "User" u ON u.id = s."userId" WHERE u.email = $1`,
      [email],
    );
    expect(rows).toHaveLength(0);
  });

  test("resending replaces the pending code rather than stacking a second one", async ({ page }) => {
    const email = `signin-code-resend-${Date.now()}@uwo.ca`;

    await page.goto("/auth/signin");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send sign-in code" }).click();
    await page.waitForURL(/verify-code/, { timeout: 10000 });

    const [{ id: firstId }] = (
      await pool.query(`SELECT id FROM "SignInCode" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1`, [email])
    ).rows;

    await page.getByRole("button", { name: /send a new code/i }).click();
    await page.waitForTimeout(1000);

    const rows = (await pool.query(`SELECT id FROM "SignInCode" WHERE email = $1`, [email])).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0].id).not.toBe(firstId);
  });

  test("the code input only accepts digits and caps at 6 characters", async ({ page }) => {
    const email = `signin-code-input-${Date.now()}@uwo.ca`;

    await page.goto("/auth/signin");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send sign-in code" }).click();
    await page.waitForURL(/verify-code/, { timeout: 10000 });

    const input = page.locator('input[inputmode="numeric"]');
    await input.fill("12a3!b456789");
    await expect(input).toHaveValue("123456");
  });
});
