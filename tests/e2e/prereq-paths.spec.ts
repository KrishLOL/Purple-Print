import { test, expect } from "@playwright/test";

test.describe("prerequisite paths", () => {
  test("switching discipline updates the graph and the URL", async ({ page }) => {
    await page.goto("/paths?discipline=mechatronics");
    await expect(page.getByRole("link", { name: /MSE 4499/ })).toBeVisible();

    await page.getByLabel("Choose a discipline").selectOption("software");
    await expect(page).toHaveURL(/discipline=software/);
    await expect(page.getByRole("link", { name: /SE 4450/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /MSE 4499/ })).toHaveCount(0);
  });

  test("hovering a course highlights its direct prerequisite and shows the raw prerequisite text", async ({
    page,
  }) => {
    await page.goto("/paths?discipline=mechatronics");
    // MSE 4499 sits in the graph's last column, off the initial viewport
    // of the horizontally-scrolling container -- Playwright's built-in
    // auto-scroll doesn't reliably reach into a nested overflow-x
    // container, so scroll explicitly before interacting.
    const target = page.getByRole("link", { name: /MSE 4499/ });
    await target.scrollIntoViewIfNeeded();
    await target.hover();

    // The raw prerequisite text panel should appear and contain the real
    // source text (a cross-discipline reference to a Mechanical course).
    // (The page's own intro copy also contains the phrase "full
    // prerequisite text", so match on the course code prefix that's
    // unique to the hover panel instead.)
    await expect(page.locator("p", { hasText: "MSE 4499 —" })).toContainText("MME 3380A/B");

    // Its direct external prerequisite should be pulled into the graph
    // and rendered as a dashed (cross-discipline) node.
    const external = page.getByRole("link", { name: /MME 3380A\/B/ });
    await expect(external).toBeVisible();

    // An unrelated node in the same discipline should be dimmed (not
    // connected to the hovered course).
    const unrelated = page.getByRole("link", { name: /MSE 2201A\/B/ });
    const opacity = await unrelated.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeLessThan(1);
  });

  test("a course node links to its real course page", async ({ page }) => {
    await page.goto("/paths?discipline=mechatronics");
    const target = page.getByRole("link", { name: /MSE 4499/ });
    await target.scrollIntoViewIfNeeded();
    await target.click();
    await expect(page).toHaveURL(/\/course\/MSE%204499/);
  });
});
