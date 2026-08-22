import { test, expect } from "@playwright/test";

/**
 * /auth/confirm exists because institutional email (uwo.ca runs on
 * Microsoft 365) commonly auto-visits links in incoming mail for security
 * scanning before the user opens the message, silently consuming Auth.js's
 * single-use magic-link token. This intermediate page requires a genuine
 * click before the real (token-consuming) callback URL is ever touched.
 *
 * It takes a `url` search param that becomes a clickable link, so it's
 * also a potential open-redirect vector if not validated -- these tests
 * cover that validation, which is fully deterministic and doesn't need a
 * real Auth.js token (unlike the full sign-in completion, which does -- see
 * the manual verification notes in the commit for that part).
 */
test.describe("auth confirm page", () => {
  test("accepts a same-origin Auth.js callback URL and renders it as the confirm link", async ({
    page,
    baseURL,
  }) => {
    const target = `${baseURL}/api/auth/callback/nodemailer?token=fake&email=test%40uwo.ca`;
    await page.goto(`/auth/confirm?url=${encodeURIComponent(target)}`);
    const link = page.getByRole("link", { name: "Confirm sign-in" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", target);
  });

  test("rejects a cross-origin URL (open-redirect protection)", async ({ page }) => {
    await page.goto(`/auth/confirm?url=${encodeURIComponent("https://evil.example/phish")}`);
    await expect(page.getByRole("link", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("rejects a same-origin URL that isn't an Auth.js callback path", async ({ page, baseURL }) => {
    await page.goto(`/auth/confirm?url=${encodeURIComponent(`${baseURL}/some-other-path`)}`);
    await expect(page.getByRole("link", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("rejects a missing url param", async ({ page }) => {
    await page.goto("/auth/confirm");
    await expect(page.getByRole("link", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });
});
