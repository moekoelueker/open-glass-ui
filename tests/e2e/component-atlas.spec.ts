import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const finalists = [
  ["hybrid", "One interface. The right glass for the moment."],
  ["css", "Editorial restraint, rendered everywhere."],
  ["webgl", "Maximum presence. Deliberately contained."],
] as const;

test("weighted ranking exposes all five engines and the three finalists", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Five engines.");
  await expect(page.locator(".ranking-table tbody tr")).toHaveCount(5);
  await expect(page.getByRole("rowheader", { name: /Adaptive Hybrid/ })).toBeVisible();

  for (const [id] of finalists) {
    await expect(page.getByRole("link", { name: new RegExp(`Open .*${id}`, "i") })).toBeVisible();
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

for (const [id, title] of finalists) {
  test(`${id} atlas renders all forty live component recipes`, async ({ page }) => {
    await page.goto(`/library/${id}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.locator(".atlas-specimen")).toHaveCount(40);
    await expect(page.locator(".atlas-specimen[data-component]")).toHaveCount(40);

    const names = await page
      .locator(".atlas-specimen")
      .evaluateAll((items) => items.map((item) => item.getAttribute("data-component")));
    expect(new Set(names).size).toBe(40);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test(`${id} atlas has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(`/library/${id}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`${id} atlas remains within the mobile page boundary`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/library/${id}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
}

test("atlas recipes complete their interaction contracts", async ({ page }) => {
  await page.goto("/library/hybrid");

  await page.getByRole("button", { name: "Page 4" }).click();
  await expect(page.getByRole("button", { name: "Page 4" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByRole("button", { name: "What happens without backdrop-filter?" }).click();
  await expect(
    page.getByText("The same component switches to a high-contrast opaque material."),
  ).toBeVisible();

  const dialogTrigger = page.getByRole("button", { name: "Open publish dialog" });
  await dialogTrigger.click();
  await expect(page.getByRole("dialog", { name: "Publish material" })).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Publish material" }).getByRole("button", {
      name: "Close Publish material",
    }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialogTrigger).toBeFocused();

  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(page.getByRole("button", { name: "Show toast" })).toBeVisible();
  await page.getByRole("button", { name: "Show toast" }).click();
  await expect(page.getByText("Preset saved")).toBeVisible();

  await page.getByRole("button", { name: "Clear Search components" }).click();
  await expect(page.getByRole("searchbox", { name: "Search components" })).toHaveValue("");

  const increase = page.getByRole("button", { name: "Increase Samples" });
  await increase.click();
  await expect(page.getByRole("spinbutton", { name: "Samples" })).toHaveValue("4");

  await page.getByRole("button", { name: "Verify 3 browsers" }).click();
  await expect(page.getByRole("button", { name: "Verify 3 browsers" })).toHaveAttribute(
    "aria-current",
    "step",
  );

  await page.getByLabel("Add an optical source").setInputFiles({
    name: "source.png",
    mimeType: "image/png",
    buffer: Buffer.from("pixels"),
  });
  await expect(page.getByText("source.png")).toBeVisible();
});

test("theme studio persists adaptive appearance, presets, radius, and custom color", async ({
  page,
}) => {
  await page.goto("/library/hybrid");
  const themeScope = page.locator(".atlas-page");

  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.getByLabel("Accent preset").selectOption("violet");
  await page.getByLabel("Corner language").selectOption("sharp");
  await page.locator('input[name="theme-accent"]').evaluate((element) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    valueSetter?.call(input, "#2057d4");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  await expect(themeScope).toHaveAttribute("data-ogui-appearance", "light");
  await expect(page.locator('input[name="theme-accent"]')).toHaveValue("#2057d4");
  await expect(page).toHaveURL(/appearance=light/);
  await expect(page).toHaveURL(/preset=violet/);
  await expect(page).toHaveURL(/radius=sharp/);
  await expect(page).toHaveURL(/accent=%232057d4/);

  const theme = await themeScope.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      accent: style.getPropertyValue("--ogui-color-accent").trim(),
      background: style.getPropertyValue("--ogui-color-background").trim(),
      radius: style.getPropertyValue("--ogui-radius-control").trim(),
    };
  });
  expect(theme).toEqual({
    accent: "#2057d4",
    background: "#f4f2ec",
    radius: "0.5rem",
  });

  const contrast = Number(
    (await page.locator(".atlas-theme-studio__result dd").nth(1).textContent())?.split(":")[0],
  );
  expect(contrast).toBeGreaterThanOrEqual(4.5);

  await page.reload();
  await expect(themeScope).toHaveAttribute("data-ogui-appearance", "light");
  await expect(page.locator('input[name="theme-accent"]')).toHaveValue("#2057d4");
});

test("the WebGL finalist reaches a stable renderer state", async ({ page, browserName }) => {
  await page.goto("/library/webgl");
  const surface = page.locator("[data-ogui-webgl-surface]");
  await expect(surface).toBeAttached();
  const status = await surface.getAttribute("data-ogui-webgl-status");
  if (browserName === "chromium") {
    expect(status).toBe("ready");
  } else {
    expect(["ready", "unavailable"]).toContain(status);
  }
});
