import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("compare renders the same scene in both designs", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByRole("heading", { level: 1, name: "Before and after" })).toBeVisible();

  const designs = await page
    .locator(".compare-scene")
    .evaluateAll((scenes) => scenes.map((scene) => scene.getAttribute("data-ogui-design")));
  expect(designs).toEqual(["classic", "liquid"]);

  // A classic island nested inside the liquid page must not pick up liquid
  // styling: the nearest design scope wins.
  const radii = await page.locator(".compare-scene").evaluateAll((scenes) =>
    scenes.map((scene) => {
      const button = scene.querySelector(".ogui-button--primary");
      return button ? getComputedStyle(button).borderTopLeftRadius : "";
    }),
  );
  expect(radii[0]).toBe("12.8px");
  expect(Number.parseFloat(radii[1] ?? "0")).toBeGreaterThan(100);
});

test("the divider is keyboard operable", async ({ page }) => {
  await page.goto("/compare");
  const divider = page.getByRole("slider", { name: "Before and after divider" });
  await divider.focus();
  await page.keyboard.press("Home");
  await expect(divider).toHaveAttribute("aria-valuenow", "0");
  await page.keyboard.press("ArrowRight");
  await expect(divider).toHaveAttribute("aria-valuenow", "2");
  await page.keyboard.press("End");
  await expect(divider).toHaveAttribute("aria-valuenow", "100");
});

test("the liquid thumb follows the selected segment", async ({ page }) => {
  await page.goto("/compare?split=0");
  const toolbar = page.getByRole("toolbar", { name: "View options (liquid)" });
  const group = toolbar.getByRole("group", { name: "Layout" });
  await expect(group).toHaveAttribute("data-ogui-indicator", "ready");
  const before = await group.evaluate((element) =>
    element.style.getPropertyValue("--ogui-indicator-x"),
  );
  await toolbar.getByRole("button", { name: "Mixes" }).click();
  await expect
    .poll(() => group.evaluate((element) => element.style.getPropertyValue("--ogui-indicator-x")))
    .not.toBe(before);
});

test("compare has no automatically detectable accessibility violations", async ({ page }) => {
  for (const appearance of ["dark", "light"]) {
    await page.goto(`/compare?appearance=${appearance}`);
    await expect(page.locator(".compare-scene")).toHaveCount(2);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});

test("compare stays inside the page boundary on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/compare");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
