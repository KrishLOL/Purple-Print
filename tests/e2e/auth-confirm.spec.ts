import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { query } from "./helpers/db";

/**
 * /auth/confirm exists because institutional email (uwo.ca runs on
 * Microsoft 365) commonly scans or rewrites links in incoming mail before
 * the user opens the message, silently consuming Auth.js's single-use
 * magic-link token. This intermediate page requires a genuine click
 * before the real (token-consuming) callback URL is ever touched.
 *
 * Two things changed across earlier attempts at this, both confirmed live
 * against real uwo.ca mail rather than assumed:
 * - The confirm control is a <button onClick>, not a plain <a href> — a
 *   link version still got its target consumed before any user click,
 *   meaning whatever scans this mail also crawls the resulting page's
 *   HTML and follows hrefs it finds there.
 * - Even that wasn't enough: the token was gone from pure mail delivery,
 *   before the user had even opened the email. The real callback URL is
 *   now stored server-side (PendingMagicLink) and referenced by an opaque
 *   id rather than a `?url=` query param, since redirect-shaped
 *   parameters like that are specifically what anti-phishing mail
 *   scanners detect and auto-follow.
 */
test.describe("auth confirm page", () => {
  test("a valid pending link renders the confirm button, which navigates there only on click", async ({
    page,
    baseURL,
  }) => {
    const target = `${baseURL}/api/auth/callback/nodemailer?token=fake&email=test%40uwo.ca`;
    const [row] = await query<{ id: string }>(
      `INSERT INTO "PendingMagicLink" (id, "targetUrl", "createdAt") VALUES ($1, $2, now()) RETURNING id`,
      [randomUUID(), target],
    );

    await page.goto(`/auth/confirm?id=${row.id}`);
    const button = page.getByRole("button", { name: "Confirm sign-in" });
    await expect(button).toBeVisible();

    // The real URL must not appear anywhere in the page as a static,
    // crawlable href or query param.
    expect(page.url()).not.toContain(encodeURIComponent(target));
    await expect(page.locator(`a[href*="${target}"]`)).toHaveCount(0);

    // Clicking it should be the only thing that triggers navigation to
    // the callback endpoint -- with a fake token, Auth.js rejects it, so
    // landing on the error page (rather than staying put) confirms the
    // request actually went through.
    await button.click();
    await page.waitForURL(/\/auth\/error/, { timeout: 10000 });
  });

  test("rejects a missing id", async ({ page }) => {
    await page.goto("/auth/confirm");
    await expect(page.getByRole("button", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("rejects an id that doesn't exist", async ({ page }) => {
    await page.goto(`/auth/confirm?id=${randomUUID()}`);
    await expect(page.getByRole("button", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("rejects an expired pending link", async ({ page, baseURL }) => {
    const target = `${baseURL}/api/auth/callback/nodemailer?token=fake&email=old%40uwo.ca`;
    const [row] = await query<{ id: string }>(
      `INSERT INTO "PendingMagicLink" (id, "targetUrl", "createdAt") VALUES ($1, $2, now() - interval '25 hours') RETURNING id`,
      [randomUUID(), target],
    );

    await page.goto(`/auth/confirm?id=${row.id}`);
    await expect(page.getByRole("button", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });
});
