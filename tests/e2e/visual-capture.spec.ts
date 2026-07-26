import path from "node:path";
import { expect, test } from "@playwright/test";

const experiments = [
  ["css", "Layered CSS Material"],
  ["organic", "Organic SVG Engine"],
  ["sdf", "Geometric SDF Engine"],
  ["webgl", "WebGL2 Optical Engine"],
  ["hybrid", "Adaptive Hybrid Engine"],
] as const;

function screenshotPath(
  pass: "pass-01" | "pass-02",
  project: string,
  viewport: "desktop" | "mobile",
  name: string,
) {
  return path.join("artifacts", "screenshots", pass, project, viewport, `${name}.jpg`);
}

test.describe("visual evidence capture", () => {
  test.use({ colorScheme: "dark", reducedMotion: "reduce" });
  test.setTimeout(120_000);

  test("desktop home and experiment specimens", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/research");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Glass is not");
    await page.screenshot({
      path: screenshotPath("pass-02", testInfo.project.name, "desktop", "home"),
      type: "jpeg",
      quality: 86,
    });

    for (const [id, title] of experiments) {
      await page.goto(`/experiments/${id}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await page.screenshot({
        path: screenshotPath("pass-02", testInfo.project.name, "desktop", `${id}-hero`),
        type: "jpeg",
        quality: 86,
      });
      await page.locator(".instrument").screenshot({
        path: screenshotPath("pass-02", testInfo.project.name, "desktop", `${id}-instrument`),
        type: "jpeg",
        quality: 86,
      });
      await page.locator(".background-matrix").screenshot({
        path: screenshotPath("pass-02", testInfo.project.name, "desktop", `${id}-matrix`),
        type: "jpeg",
        quality: 86,
      });
    }
  });

  test("mobile home and experiment specimens", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/research");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Glass is not");
    await page.screenshot({
      path: screenshotPath("pass-02", testInfo.project.name, "mobile", "home"),
      type: "jpeg",
      quality: 86,
    });

    for (const [id, title] of experiments) {
      await page.goto(`/experiments/${id}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await page.screenshot({
        path: screenshotPath("pass-02", testInfo.project.name, "mobile", `${id}-hero`),
        type: "jpeg",
        quality: 86,
      });
      await page.locator(".instrument").screenshot({
        path: screenshotPath("pass-02", testInfo.project.name, "mobile", `${id}-instrument`),
        type: "jpeg",
        quality: 86,
      });
    }
  });
});
