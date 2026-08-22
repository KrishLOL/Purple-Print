import { test, expect } from "@playwright/test";

/**
 * /auth/confirm exists because institutional email (uwo.ca runs on
 * Microsoft 365) commonly auto-visits links in incoming mail for security
 * scanning before the user opens the message, silently consuming Auth.js's
 * single-use magic-link token. This intermediate page requires a genuine
 * click before the real (token-consuming) callback URL is ever touched.
 *
 * The confirm control is a <button onClick>, not a plain <a href> -- an
 * earlier version used a link, and the token still got consumed before
 * the user clicked anything, meaning whatever scans uwo.ca mail also
 * crawls the resulting page's HTML and follows any href it finds there.
 * Gating navigation behind a real click event defeats that, since a
 * crawler fetching HTML and parsing href attributes doesn't dispatch
 * click events the way a real browser does.
 *
 * It takes a `url` search param that ends up driving that navigation, so
 * it's also a potential open-redirect vector if not validated -- these
 * tests cover that validation, which is fully deterministic and doesn't
 * need a real Auth.js token (unlike the full sign-in completion, which
 * does -- see the manual verification notes in the commit for that part).
 */
test.describe("auth confirm page", () => {
  test("accepts a same-origin Auth.js callback URL and navigates there only on click", async ({
    page,
    baseURL,
  }) => {
    const target = `${baseURL}/api/auth/callback/nodemailer?token=fake&email=test%40uwo.ca`;
    await page.goto(`/auth/confirm?url=${encodeURIComponent(target)}`);

    const button = page.getByRole("button", { name: "Confirm sign-in" });
    await expect(button).toBeVisible();
    // The URL must not appear as a static, crawlable href anywhere.
    await expect(page.locator(`a[href="${target}"]`)).toHaveCount(0);

    // Clicking it should be the only thing that triggers navigation to
    // the callback endpoint -- with a fake token, Auth.js rejects it, so
    // landing on the error page (rather than staying on /auth/confirm or
    // erroring client-side) confirms the request actually went through.
    await button.click();
    await page.waitForURL(/\/auth\/error/, { timeout: 10000 });
  });

  test("rejects a cross-origin URL (open-redirect protection)", async ({ page }) => {
    await page.goto(`/auth/confirm?url=${encodeURIComponent("https://evil.example/phish")}`);
    await expect(page.getByRole("button", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("rejects a same-origin URL that isn't an Auth.js callback path", async ({ page, baseURL }) => {
    await page.goto(`/auth/confirm?url=${encodeURIComponent(`${baseURL}/some-other-path`)}`);
    await expect(page.getByRole("button", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("rejects a missing url param", async ({ page }) => {
    await page.goto("/auth/confirm");
    await expect(page.getByRole("button", { name: "Confirm sign-in" })).toHaveCount(0);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });
});
