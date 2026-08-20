import { test, expect } from "@playwright/test";

test.describe("browse filtering", () => {
  test("filtering to a discipline + year updates the URL, survives reload, and supports back", async ({ page }) => {
    await page.goto("/browse");

    await page.getByRole("button", { name: /Mechanical Engineering/i }).click();
    await expect(page).toHaveURL(/discipline=mechanical/);

    await page.getByRole("button", { name: "Year 3" }).click();
    await expect(page).toHaveURL(/discipline=mechanical/);
    await expect(page).toHaveURL(/year=3/);

    const countText = await page.locator("text=/\\d+ courses?/").first().innerText();
    expect(countText).toMatch(/\d+ courses?/);

    // Survives a full reload.
    await page.reload();
    await expect(page).toHaveURL(/discipline=mechanical/);
    await expect(page).toHaveURL(/year=3/);
    await expect(page.locator("text=/\\d+ courses?/").first()).toHaveText(countText);

    // Back button steps back through each filter.
    await page.goBack();
    await expect(page).toHaveURL(/discipline=mechanical/);
    await expect(page).not.toHaveURL(/year=3/);

    await page.goBack();
    await expect(page).not.toHaveURL(/discipline=mechanical/);
  });

  test("sorting by a rating column keeps low-sample courses pinned to the bottom", async ({ page }) => {
    await page.goto("/browse?sort=useful&dir=desc");

    const rows = page.locator('[role="table"] [role="row"]');
    const lastRow = rows.last();
    await expect(lastRow.locator("text=—").first()).toBeVisible();
  });

  test("search box on the landing page navigates to /browse with the query", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Search courses, professors, or topics").fill("programming");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/browse\?q=programming/);
  });
});
