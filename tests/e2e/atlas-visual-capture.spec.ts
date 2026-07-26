import path from "node:path";
import { expect, test } from "@playwright/test";

const finalists = [
  ["hybrid", "One interface. The right glass for the moment."],
  ["css", "Editorial restraint, rendered everywhere."],
  ["webgl", "Maximum presence. Deliberately contained."],
] as const;

function screenshotPath(project: string, viewport: "desktop" | "mobile", name: string) {
  return path.join("artifacts", "screenshots", "atlas-pass-02", project, viewport, `${name}.jpg`);
}

test.describe("component atlas visual evidence", () => {
  test.use({ reducedMotion: "reduce" });
  test.setTimeout(120_000);

  test("desktop ranking, finalists, and component specimens", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/library");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Five engines\.\s*Three make the cut\./,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: screenshotPath(testInfo.project.name, "desktop", "ranking"),
      type: "jpeg",
      quality: 88,
    });

    for (const [id, title] of finalists) {
      await page.goto(`/library/${id}`);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await page.screenshot({
        path: screenshotPath(testInfo.project.name, "desktop", `${id}-hero`),
        type: "jpeg",
        quality: 88,
      });
      await page
        .locator(".atlas-specimen")
        .first()
        .screenshot({
          path: screenshotPath(testInfo.project.name, "desktop", `${id}-button`),
          type: "jpeg",
          quality: 88,
        });
    }
  });

  test("mobile ranking, finalists, and component specimens", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/library");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Five engines\.\s*Three make the cut\./,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: screenshotPath(testInfo.project.name, "mobile", "ranking"),
      type: "jpeg",
      quality: 86,
    });

    for (const [id, title] of finalists) {
      await page.goto(`/library/${id}`);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await page.screenshot({
        path: screenshotPath(testInfo.project.name, "mobile", `${id}-hero`),
        type: "jpeg",
        quality: 86,
      });
      await page
        .locator(".atlas-specimen")
        .first()
        .screenshot({
          path: screenshotPath(testInfo.project.name, "mobile", `${id}-button`),
          type: "jpeg",
          quality: 86,
        });
    }
  });
});
