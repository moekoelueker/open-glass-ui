import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const output = (browserName: string, ...segments: string[]) =>
  path.join(
    "artifacts",
    "screenshots",
    "open-glass-ui-final",
    ...(browserName === "chromium" ? [] : ["cross-browser", browserName]),
    ...segments,
  );

async function settleVisual(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

test.describe("OpenGlass UI final visual evidence", () => {
  test.use({ reducedMotion: "reduce" });
  test.setTimeout(120_000);

  test("captures the ranked engines and explicit neutral theme variants", async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Glass is not a blur. It’s an interface system.",
      }),
    ).toBeVisible();
    await settleVisual(page);
    await page.screenshot({
      path: output(browserName, "desktop", "landing-dark-neutral.jpg"),
      type: "jpeg",
      quality: 90,
    });

    await page.goto("/library");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Five engines\.\s*Three make the cut\./,
      }),
    ).toBeVisible();
    await settleVisual(page);
    await page.screenshot({
      path: output(browserName, "desktop", "ranking.jpg"),
      type: "jpeg",
      quality: 90,
    });

    for (const engine of ["hybrid", "css", "webgl"] as const) {
      await page.goto(`/library/${engine}?appearance=dark&preset=neutral&radius=balanced`);
      await expect(page.locator(".atlas-page")).toHaveAttribute("data-ogui-appearance", "dark");
      await expect(page.locator(".atlas-page")).toHaveAttribute("data-ogui-theme-hydrated", "true");
      await expect(page.locator(".atlas-hero__glass > strong")).toBeVisible();
      await expect(page.getByRole("link", { name: "OpenGlass UI home" }).first()).toBeVisible();
      await settleVisual(page);
      await page.screenshot({
        path: output(browserName, "desktop", `${engine}-dark-neutral.jpg`),
        type: "jpeg",
        quality: 90,
      });
    }

    await page.goto("/library/hybrid?appearance=light&preset=neutral&radius=balanced");
    await expect(page.locator(".atlas-page")).toHaveAttribute("data-ogui-appearance", "light");
    await expect(page.locator(".atlas-page")).toHaveAttribute("data-ogui-theme-hydrated", "true");
    await expect(page.locator(".atlas-hero__glass > strong")).toBeVisible();
    await settleVisual(page);
    await page.screenshot({
      path: output(browserName, "desktop", "hybrid-light-neutral.jpg"),
      type: "jpeg",
      quality: 90,
    });
    await page.locator(".atlas-theme-studio").screenshot({
      path: output(browserName, "desktop", "theme-studio-light-neutral.jpg"),
      type: "jpeg",
      quality: 90,
    });
  });

  test("captures a custom accent system at a mobile boundary", async ({ page, browserName }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Glass is not a blur. It’s an interface system.",
      }),
    ).toBeVisible();
    await settleVisual(page);
    await page.screenshot({
      path: output(browserName, "mobile", "landing-dark-neutral.jpg"),
      type: "jpeg",
      quality: 90,
    });

    await page.goto(
      "/library/hybrid?appearance=dark&preset=neutral&radius=balanced&accent=%232057d4&secondary=%23735ad8&tertiary=%2320a7a0",
    );
    await expect(page.locator(".atlas-page")).toHaveAttribute("data-ogui-appearance", "dark");
    await expect(page.locator(".atlas-page")).toHaveAttribute("data-ogui-theme-hydrated", "true");
    await expect(page.locator('input[name="theme-accent"]')).toHaveValue("#2057d4");
    await settleVisual(page);
    await page.screenshot({
      path: output(browserName, "mobile", "hybrid-custom-accent.jpg"),
      type: "jpeg",
      quality: 90,
    });
    await page.locator(".atlas-theme-studio").screenshot({
      path: output(browserName, "mobile", "theme-studio-custom-accent.jpg"),
      type: "jpeg",
      quality: 90,
    });
    await page
      .locator(".atlas-specimen")
      .first()
      .screenshot({
        path: output(browserName, "mobile", "button-custom-accent.jpg"),
        type: "jpeg",
        quality: 90,
      });
  });
});
