import { expect, test } from "@playwright/test";

test("serves the isolated showcase workspace", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("main")).toHaveText("Prism Lab scaffold");
  await expect(page).toHaveTitle(/Prism Lab/);
});
