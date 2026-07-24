import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const experiments = [
  ["css", "Layered CSS Material"],
  ["organic", "Organic SVG Engine"],
  ["sdf", "Geometric SDF Engine"],
  ["webgl", "WebGL2 Optical Engine"],
  ["hybrid", "Adaptive Hybrid Engine"],
] as const;

test("comparison home exposes all five experiments", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Glass is not");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("a blur.");

  for (const [, title] of experiments) {
    await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

for (const [id, title] of experiments) {
  test(`${id} route renders the shared comparison burden`, async ({ page }) => {
    await page.goto(`/experiments/${id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByRole("region", { name: "Interactive component specimen" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Preview environment" })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Spectral edge" })).toBeChecked();
    await expect(page.locator(".matrix-tile")).toHaveCount(6);
    await expect(page.getByRole("tablist", { name: "Recipe categories" })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test(`${id} route has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(`/experiments/${id}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("shared controls expose and update authoritative state", async ({ page }) => {
  await page.goto("/experiments/hybrid");

  const more = page.getByRole("button", { name: "More actions" });
  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("menuitem", { name: "Duplicate specimen" }).click();
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await expect(more).toBeFocused();

  await page.getByRole("button", { name: "Frosted" }).click();
  await expect(page.locator(".engine-surface")).toHaveAttribute("data-prism-material", "frosted");

  const spectral = page.getByRole("switch", { name: "Spectral edge" });
  await spectral.uncheck();
  await expect(spectral).not.toBeChecked();

  await page.getByRole("tab", { name: "Disclosure" }).click();
  const popover = page.getByRole("button", { name: "About the sample" });
  await popover.click();
  await expect(page.getByRole("dialog", { name: "About the sample" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popover).toHaveAttribute("aria-expanded", "false");
  await expect(popover).toBeFocused();
});

test("WebGL surface reaches a stable renderer state", async ({ page, browserName }) => {
  await page.goto("/experiments/webgl");
  const surface = page.locator("[data-prism-webgl-surface]");
  await expect(surface).toBeAttached();
  const status = await surface.getAttribute("data-prism-webgl-status");
  const rendererError = await surface.getAttribute("data-prism-webgl-error");

  if (browserName === "chromium") {
    expect(status, rendererError ?? "WebGL renderer should be ready").toBe("ready");
  } else {
    expect(["ready", "unavailable"]).toContain(status);
  }
});
