import { test, expect } from "@playwright/test";

test.describe("degree roadmap", () => {
  test("switching discipline updates the grid and the URL", async ({ page }) => {
    await page.goto("/plan?discipline=electrical");
    await expect(page.getByRole("link", { name: /ECE 2205A\/B/ })).toBeVisible();

    await page.getByLabel("Choose a discipline").selectOption("software");
    await expect(page).toHaveURL(/discipline=software/);
    await expect(page.getByRole("link", { name: /SE 2202A\/B/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /ECE 2205A\/B/ })).toHaveCount(0);
  });

  test("shows a genuine elective choice as a non-clickable slot, not a fabricated course", async ({ page }) => {
    await page.goto("/plan?discipline=mechatronics");
    await expect(page.getByText("ECE 4460A/B or ECE 4469A/B (choose one)")).toBeVisible();
    // It's a description, not a link -- there's no such course in the catalog.
    await expect(
      page.getByRole("link", { name: /ECE 4460A\/B or ECE 4469A\/B/ }),
    ).toHaveCount(0);
  });

  test("a course card links to its real course page", async ({ page }) => {
    await page.goto("/plan?discipline=civil");
    const target = page.getByRole("link", { name: /CEE 2220A\/B/ });
    await target.click();
    await expect(page).toHaveURL(/\/course\/CEE%202220A%2FB/);
  });

  test("choosing a double-degree program switches to the 5-year combined sequence", async ({ page }) => {
    await page.goto("/plan?discipline=electrical");
    await expect(page.getByRole("link", { name: /AISE 2205A\/B/ })).toHaveCount(0);

    await page.getByLabel("Choose a double-degree program").selectOption("aise");
    await expect(page).toHaveURL(/discipline=electrical/);
    await expect(page).toHaveURL(/overlay=aise/);
    await expect(page.getByText(/double degree restructures the curriculum/)).toBeVisible();
    await expect(page.getByRole("link", { name: /AISE 2205A\/B/ })).toBeVisible();
  });

  test("a discipline with no double-degree option disables the second dropdown", async ({ page }) => {
    await page.goto("/plan?discipline=civil");
    await expect(page.getByLabel("Choose a double-degree program")).toBeDisabled();
  });

  test("switching the base discipline drops a no-longer-valid overlay selection", async ({ page }) => {
    await page.goto("/plan?discipline=electrical&overlay=aise");
    await page.getByLabel("Choose a discipline").selectOption("civil");
    await expect(page).not.toHaveURL(/overlay=/);
    await expect(page.getByLabel("Choose a double-degree program")).toBeDisabled();
  });
});
