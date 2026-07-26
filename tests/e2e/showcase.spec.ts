import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const experiments = [
  ["css", "Layered CSS Material"],
  ["organic", "Organic SVG Engine"],
  ["sdf", "Geometric SDF Engine"],
  ["webgl", "WebGL2 Optical Engine"],
  ["hybrid", "Adaptive Hybrid Engine"],
] as const;

const engineAnnotations = {
  css: ".css-layer-legend",
  organic: ".organic-caustic",
  sdf: ".sdf-fiducials",
  webgl: ".source-ownership",
  hybrid: ".policy-rail",
} as const;

test("comparison home exposes all five experiments", async ({ page }) => {
  await page.goto("/research");
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

test("keyboard users can bypass repeated navigation", async ({ page, browserName }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  // Safari's default macOS preference uses Option-Tab for links; users who
  // enable full keyboard access use Tab like the other engines.
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

for (const [id, title] of experiments) {
  test(`${id} route renders the shared comparison burden`, async ({ page }) => {
    await page.goto(`/experiments/${id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(
      page.getByRole("region", { name: "Interactive component specimen" }),
    ).toBeVisible();
    await expect(page.getByRole("group", { name: "Preview environment" })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Spectral edge" })).toBeChecked();
    await expect(page.locator(".matrix-tile")).toHaveCount(6);
    await expect(page.getByRole("tablist", { name: "Recipe categories" })).toBeVisible();
    await expect(page.locator(engineAnnotations[id])).toBeAttached();

    await page.getByRole("button", { name: "Frosted" }).click();
    await expect(page.locator(".engine-surface").first()).toHaveAttribute(
      "data-ogui-material",
      "frosted",
    );
    await page.getByRole("slider", { name: "Optical intensity" }).fill("84");
    await expect(page.getByRole("slider", { name: "Optical intensity" })).toHaveValue("84");
    await page.getByRole("switch", { name: "Spectral edge" }).uncheck();
    await expect(page.getByRole("switch", { name: "Spectral edge" })).not.toBeChecked();

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
  await expect(page.locator(".engine-surface")).toHaveAttribute("data-ogui-material", "frosted");

  const layout = page.getByRole("button", { name: "Change layout" });
  await layout.hover();
  await expect(page.getByRole("tooltip", { name: "Change layout" })).toBeVisible();
  await layout.focus();
  await expect(layout).toBeFocused();
  await page.mouse.down();
  await page.mouse.up();

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

  await page.getByRole("tab", { name: "Actions" }).click();
  await expect(page.getByRole("button", { name: "Disabled" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Mix" })).toHaveAttribute("aria-pressed", "true");
});

test("WebGL surface reaches a stable renderer state", async ({ page, browserName }) => {
  await page.goto("/experiments/webgl");
  const surface = page.locator("[data-ogui-webgl-surface]");
  await expect(surface).toBeAttached();
  const status = await surface.getAttribute("data-ogui-webgl-status");
  const rendererError = await surface.getAttribute("data-ogui-webgl-error");

  if (browserName === "chromium") {
    expect(status, rendererError ?? "WebGL renderer should be ready").toBe("ready");
  } else {
    expect(["ready", "unavailable"]).toContain(status);
  }
});

test("reduced motion freezes optical animation and media", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/experiments/organic");

  await expect(page.locator(".engine-surface").first()).toHaveAttribute("data-ogui-motion", "off");
  await expect(page.locator("[data-ogui-organic-definition] animate")).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator(".instrument video")
        .evaluateAll((videos) => videos.every((video) => (video as HTMLVideoElement).paused)),
    )
    .toBe(true);
});

test("reduced transparency selects the accessibility renderer", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      const result = nativeMatchMedia(query);
      if (query === "(prefers-reduced-transparency: reduce)") {
        Object.defineProperty(result, "matches", { configurable: true, value: true });
      }
      return result;
    };
  });
  await page.goto("/experiments/hybrid");

  const glass = page.locator(".engine-surface").first();
  await expect(glass).toHaveAttribute("data-ogui-renderer", "css");
  await expect(glass).toHaveAttribute("data-ogui-renderer-reason", "accessibility-fallback");
  await expect(glass).toHaveAttribute("data-ogui-quality", "low");
  await expect(page.getByText("A11Y / OPAQUE", { exact: true })).toHaveClass(/is-active/);
});

test("forced colors selects the opaque policy branch", async ({ page, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "forced-colors emulation is a Chromium-only Playwright API",
  );
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/experiments/hybrid");

  const glass = page.locator(".engine-surface").first();
  await expect(glass).toHaveAttribute("data-ogui-renderer", "css");
  await expect(glass).toHaveAttribute("data-ogui-renderer-reason", "accessibility-fallback");
  await expect(page.getByText("A11Y / OPAQUE", { exact: true })).toHaveClass(/is-active/);
});

test("auto quality drops on low-concurrency hardware", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "hardwareConcurrency", {
      configurable: true,
      get: () => 2,
    });
  });
  await page.goto("/experiments/css");
  await expect(page.locator(".engine-surface").first()).toHaveAttribute("data-ogui-quality", "low");
});

test("WebGL unavailability exposes a stable CSS fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(
      contextId: string,
      options?: unknown,
    ) {
      if (contextId === "webgl2") {
        return null;
      }
      return nativeGetContext.call(this, contextId, options);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/experiments/webgl");

  await expect(page.locator("[data-ogui-webgl-surface]")).toHaveAttribute(
    "data-ogui-webgl-status",
    "unavailable",
  );
  await expect(page.locator(".webgl-backdrop")).toBeVisible();
  await expect(page.locator(".engine-surface").first()).toBeVisible();
});

test("motion sources can swap without leaked media state", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/experiments/organic");

  const instrument = page.locator(".instrument");
  const environment = page.getByRole("group", { name: "Preview environment" });
  const video = instrument.locator("video.environment__video");
  await expect(video).toHaveCount(1);
  await expect
    .poll(() =>
      video.evaluate((element) => {
        const source = element as HTMLVideoElement;
        return {
          height: source.videoHeight,
          paused: source.paused,
          source: source.currentSrc,
          width: source.videoWidth,
        };
      }),
    )
    .toMatchObject({
      height: 540,
      paused: false,
      source: /motion-source\.mp4/,
      width: 960,
    });

  await environment.getByRole("button", { name: "Photo" }).click();
  await expect(video).toHaveCount(0);
  await environment.getByRole("button", { name: "Motion" }).click();
  await expect(video).toHaveCount(1);
  await expect
    .poll(() => video.evaluate((element) => !(element as HTMLVideoElement).paused))
    .toBe(true);
  expect(pageErrors).toEqual([]);
});

test("route remounts and visibility transitions release WebGL resources", async ({
  page,
  browserName,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/experiments/webgl");
  const surface = page.locator("[data-ogui-webgl-surface]");
  await expect(surface).toBeAttached();

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await page.getByRole("link", { name: "Experiment 01: CSS Material" }).click();
  await expect(page).toHaveURL(/\/experiments\/css$/);
  await expect(page.locator("[data-ogui-webgl-surface]")).toHaveCount(0);
  await expect(page.locator(".instrument video")).toHaveCount(0);
  await page.getByRole("link", { name: "Experiment 04: WebGL2 Optics" }).click();
  await expect(page).toHaveURL(/\/experiments\/webgl$/);
  await expect(page.locator("[data-ogui-webgl-surface]")).toBeAttached();
  if (browserName === "chromium") {
    await expect(page.locator("[data-ogui-webgl-surface]")).toHaveAttribute(
      "data-ogui-webgl-status",
      "ready",
    );
  }
  expect(pageErrors).toEqual([]);
});

test("WebGL context loss and recovery remain observable", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "deterministic WEBGL_lose_context coverage uses Chromium");
  await page.goto("/experiments/webgl");
  const surface = page.locator("[data-ogui-webgl-surface]");
  await expect(surface).toHaveAttribute("data-ogui-webgl-status", "ready");

  const extensionAvailable = await surface.evaluate((canvas) => {
    const context = (canvas as HTMLCanvasElement).getContext("webgl2");
    const extension = context?.getExtension("WEBGL_lose_context");
    const testWindow = window as typeof window & {
      __restoreOpenGlassContext?: () => void;
    };
    testWindow.__restoreOpenGlassContext = () => extension?.restoreContext();
    extension?.loseContext();
    return Boolean(extension);
  });
  test.skip(!extensionAvailable, "WEBGL_lose_context is unavailable in this browser build");
  await expect(surface).toHaveAttribute("data-ogui-webgl-status", "lost");

  await page.evaluate(() => {
    const testWindow = window as typeof window & {
      __restoreOpenGlassContext?: () => void;
    };
    testWindow.__restoreOpenGlassContext?.();
  });
  await expect(surface).toHaveAttribute("data-ogui-webgl-status", "restored");
  await expect(surface).not.toHaveAttribute("data-ogui-webgl-error", /.+/);
});

test("portrait and landscape resizing preserve the page boundary", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/experiments/hybrid");
  await expect(page.locator(".instrument")).toBeVisible();

  await page.setViewportSize({ width: 844, height: 390 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  await expect(page.locator(".engine-surface").first()).toBeVisible();
});
