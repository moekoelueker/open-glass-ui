import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing presents one OpenGlass product and all forty public components", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("OpenGlass UI — Liquid Glass UI Components for React");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Glass is not a blur. It’s an interface system.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore 40 Components/ }).first()).toHaveAttribute(
    "href",
    "/components",
  );
  await expect(page.getByText(/Adaptive Hybrid|Native CSS|Spectral WebGL/)).toHaveCount(0);

  // The hero readout must report measurable runtime state, never a
  // self-assigned score. Guard against the invented "94 / 100" panel returning.
  await expect(page.getByText("Internal weighted library evaluation")).toHaveCount(0);
  await expect(page.getByText("94 / 100")).toHaveCount(0);

  const componentNames = await page
    .locator("[data-component-name]")
    .evaluateAll((items) => items.map((item) => item.getAttribute("data-component-name")));
  expect(componentNames).toHaveLength(40);
  expect(new Set(componentNames).size).toBe(40);
});

test("hero readout reports real runtime state and tracks the selected material", async ({
  page,
}) => {
  await page.goto("/");
  const readout = page.getByRole("region", { name: "Live material runtime readout" });
  const playground = page.getByRole("region", { name: "Live material playground" });

  // Values must match MATERIAL_PRESETS exactly, and the resolved renderer must
  // agree with what Glass wrote onto the element.
  await playground.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(readout).toContainText("1.50");
  await expect(readout).toContainText("clear material");
  await expect(readout).toContainText("Thickness 0.78");

  await playground.getByRole("button", { name: "Frosted", exact: true }).click();
  await expect(readout).toContainText("1.40");
  await expect(readout).toContainText("frosted material");
  await expect(readout).toContainText("Thickness 0.44");

  await expect(readout).toHaveAttribute("data-ogui-renderer", "css");
  await expect(readout).toContainText("CSS-first default");
});

test("dragging frost visibly thickens the hero material", async ({ page }) => {
  await page.goto("/");
  const readout = page.getByRole("region", { name: "Live material runtime readout" });
  const frost = page.getByRole("slider", { name: /Frost/i });

  const blurOf = async () =>
    Number(
      /blur\(([\d.]+)px\)/.exec(
        await readout.evaluate(
          (el) => getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter,
        ),
      )?.[1] ?? "0",
    );

  // `optics` used to be inert for the CSS renderer: the number changed and
  // nothing moved. Frost must now reach the material itself.
  await frost.fill("0");
  const low = await blurOf();
  await frost.fill("100");
  const high = await blurOf();

  expect(high).toBeGreaterThan(low);
  await expect(readout).toContainText("100%");
});

test("live material playground exposes authoritative interactive state", async ({ page }) => {
  await page.goto("/");
  const playground = page.getByRole("region", { name: "Live material playground" });

  await playground.getByRole("button", { name: "Photo", exact: true }).click();
  await expect(playground).toHaveAttribute("data-environment", "photo");
  await expect(playground.getByRole("button", { name: "Photo", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await playground.getByRole("button", { name: "Frosted", exact: true }).click();
  await expect(playground.locator("[data-landing-hero-glass]")).toHaveAttribute(
    "data-ogui-material",
    "frosted",
  );

  const intensity = playground.getByRole("slider", { name: "Optical intensity" });
  await intensity.fill("84");
  await expect(intensity).toHaveValue("84");

  await playground.getByRole("button", { name: "Violet accent" }).click();
  await expect(playground).toHaveAttribute("data-accent", "violet");
  await expect(playground.getByRole("button", { name: "Violet accent" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const motion = playground.getByRole("switch", { name: "Scene motion" });
  if (await motion.isEnabled()) {
    await playground.getByText("Scene motion", { exact: true }).click();
    await expect(motion).not.toBeChecked();
    await expect(page.locator("[data-landing-motion]")).toHaveAttribute("data-motion", "off");
  }
});

test("navigation remains one line and becomes a sticky glass rail", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/");

  const rail = page.locator("[data-landing-header]");
  const header = rail.locator(".landing-header");
  const items = [
    header.getByRole("link", { name: "OpenGlass UI home" }),
    header.getByRole("navigation", { name: "Primary navigation" }),
    header.locator(".landing-header__github"),
  ];
  const centerYs = async () =>
    Promise.all(
      items.map(async (item) => {
        const box = await item.boundingBox();
        if (!box) throw new Error("Expected visible header item");
        return box.y + box.height / 2;
      }),
    );

  await expect(rail).toHaveAttribute("data-scrolled", "false");
  const initialCenters = await centerYs();
  expect(Math.max(...initialCenters) - Math.min(...initialCenters)).toBeLessThanOrEqual(5);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 900);
  });

  await expect(rail).toHaveAttribute("data-scrolled", "true");
  await expect(rail).toHaveAttribute("data-surface", "frosted");
  await expect.poll(async () => (await rail.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
  await expect.poll(async () => (await header.boundingBox())?.y ?? 999).toBeLessThanOrEqual(20);

  await expect
    .poll(() =>
      header.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).borderTopLeftRadius),
      ),
    )
    .toBeGreaterThanOrEqual(16);
  const presentation = await header.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      shadow: style.boxShadow,
      radii: [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ].map(Number.parseFloat),
    };
  });
  expect(presentation.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(presentation.shadow).not.toBe("none");
  expect(Math.max(...presentation.radii) - Math.min(...presentation.radii)).toBeLessThanOrEqual(1);

  const scrolledCenters = await centerYs();
  expect(Math.max(...scrolledCenters) - Math.min(...scrolledCenters)).toBeLessThanOrEqual(5);
});

test("hero lenses and studio optics visibly respond to their controls", async ({ page }) => {
  await page.goto("/");

  const scene = page.locator(".landing-instrument__scene");
  const spectral = page.getByRole("button", { name: "Spectral glass lens" });
  const idleEnergy = await spectral.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue("--blob-energy")),
  );
  await spectral.hover();
  await expect
    .poll(() =>
      spectral.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).getPropertyValue("--blob-energy")),
      ),
    )
    .toBeGreaterThan(idleEnergy);
  await spectral.click();
  await expect(spectral).toHaveAttribute("aria-pressed", "true");
  await expect(scene).toHaveAttribute("data-lens-response", "spectral");

  const reflection = page.locator(".landing-shape--clear i");
  const reflectionBox = await reflection.boundingBox();
  expect(reflectionBox?.width ?? 0).toBeGreaterThan(30);
  expect(reflectionBox?.height ?? 0).toBeGreaterThan(15);

  const studio = page.locator('[data-use-case="creative-studio"]');
  const canvas = studio.locator("[data-studio-canvas]");
  const contourField = studio.locator("[data-contour-field]");
  const contours = studio.getByRole("button", { name: "Contours", exact: true });

  await expect(contours).toHaveAttribute("aria-pressed", "true");
  await expect(canvas).toHaveAttribute("data-contours", "on");
  const contourOpacity = await contourField.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).opacity),
  );
  expect(contourOpacity).toBeGreaterThan(0.1);

  await contours.click();
  await expect(contours).toHaveAttribute("aria-pressed", "false");
  await expect(canvas).toHaveAttribute("data-contours", "off");
  await expect
    .poll(() =>
      contourField.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)),
    )
    .toBeLessThan(0.1);

  const distortion = studio.getByRole("slider", { name: "Distortion" });
  const initialBlur = await canvas.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--studio-blur").trim(),
  );
  await distortion.fill("28");
  await expect(distortion).toHaveValue("28");
  await expect(canvas).toHaveAttribute("data-distortion", "28");
  await expect(studio.locator("[data-distortion-output]")).toHaveText("28%");
  await expect
    .poll(() =>
      canvas.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--studio-blur").trim(),
      ),
    )
    .not.toBe(initialBlur);
});

test("material studies explain effect and appropriate use", async ({ page }) => {
  await page.goto("/");
  const studies = page.locator("[data-material-study]");
  await expect(studies).toHaveCount(3);

  for (let index = 0; index < 3; index += 1) {
    const study = studies.nth(index);
    await expect(study).toHaveAttribute("data-material-effect", /.+/);
    await expect(study).toHaveAttribute("data-material-use", /.+/);
    await expect(study.locator(".landing-topology__mechanic")).toBeVisible();
  }

  const componentCtas = page.locator('a[data-premium-cta="components"]');
  await expect(componentCtas).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    const cta = componentCtas.nth(index);
    await expect(cta).toHaveAttribute("href", "/components");
    const style = await cta.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        background: computed.backgroundImage,
        shadow: computed.boxShadow,
        radius: Number.parseFloat(computed.borderTopLeftRadius),
        radii: [
          computed.borderTopLeftRadius,
          computed.borderTopRightRadius,
          computed.borderBottomRightRadius,
          computed.borderBottomLeftRadius,
        ].map(Number.parseFloat),
        contourRadius: getComputedStyle(element, "::before").borderTopLeftRadius,
        sheen: getComputedStyle(element, "::after").transform,
      };
    });
    expect(style.background).not.toBe("none");
    expect(style.shadow).not.toBe("none");
    expect(style.radius).toBeGreaterThanOrEqual(12);
    expect(Math.max(...style.radii) - Math.min(...style.radii)).toBeLessThanOrEqual(1);
    expect(Number.parseFloat(style.contourRadius)).toBeCloseTo(style.radius, 0);

    await cta.hover();
    await expect
      .poll(() => cta.evaluate((element) => getComputedStyle(element, "::after").transform))
      .not.toBe(style.sheen);

    await cta.focus();
    await expect(cta).toBeFocused();
    await expect
      .poll(() => cta.evaluate((element) => getComputedStyle(element).outlineStyle))
      .not.toBe("none");
  }
});

test("four product scenarios expose working component compositions", async ({ page }) => {
  await page.goto("/");
  const scenarios = page.getByRole("tablist", { name: "Product use cases" });

  await expect(page.locator('[data-use-case="creative-studio"]')).toBeVisible();
  await page.getByRole("button", { name: "Canvas information" }).click();
  await expect(page.getByRole("dialog", { name: "Canvas information" })).toBeVisible();
  await page.keyboard.press("Escape");

  await scenarios.getByRole("tab", { name: "Analytics" }).click();
  await expect(page.locator('[data-use-case="analytics-console"]')).toBeVisible();
  await page.getByRole("button", { name: "Page 4" }).click();
  await expect(page.getByRole("button", { name: "Page 4" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await scenarios.getByRole("tab", { name: "Builder" }).click();
  await expect(page.locator('[data-use-case="material-builder"]')).toBeVisible();
  await page.getByRole("button", { name: "Verify 3 browsers" }).click();
  await expect(page.getByRole("button", { name: "Verify 3 browsers" })).toHaveAttribute(
    "aria-current",
    "step",
  );

  await scenarios.getByRole("tab", { name: "Feedback" }).click();
  await expect(page.locator('[data-use-case="feedback-overlays"]')).toBeVisible();
  const dialogTrigger = page.getByRole("button", { name: "Open publish dialog" });
  await dialogTrigger.click();
  await expect(page.getByRole("dialog", { name: "Publish material" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogTrigger).toBeFocused();
});

test("install and AI resources are honest, copyable, and machine-readable", async ({
  page,
  request,
}) => {
  await page.goto("/");
  // The published package has a `latest` dist-tag, so the bare install command
  // must work. A prerelease-only publish would make this line a lie.
  await expect(page.getByText("npm install open-glass-ui react react-dom").first()).toBeVisible();

  await page.getByRole("button", { name: "Copy Install Command" }).first().click();
  await expect(page.locator("[data-copy-status]")).toContainText("Install command copied.");

  await page.getByRole("button", { name: "Copy AI Agent Prompt" }).click();
  await expect(page.locator("[data-copy-status]")).toContainText("AI agent prompt copied.");

  for (const path of ["/llms.txt", "/llms-full.txt"]) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("text/plain");
    expect(await response.text()).toContain("OpenGlass UI");
  }

  // Every GitHub reference must resolve to a real repository. The placeholder
  // "coming soon" state is gone and must not come back.
  const githubLinks = page.getByRole("link", { name: /GitHub/i });
  const githubCount = await githubLinks.count();
  expect(githubCount).toBeGreaterThan(0);
  for (let index = 0; index < githubCount; index += 1) {
    await expect(githubLinks.nth(index)).toHaveAttribute(
      "href",
      /^https:\/\/github\.com\/[^/]+\/[^/]+/,
    );
  }
  await expect(page.getByText(/coming soon/i)).toHaveCount(0);
  await expect(
    page.locator('a[href="#"], a[href=""], a[href*="OWNER"], a[href*="TODO"]'),
  ).toHaveCount(0);
});

test("landing has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("landing remains inside desktop and mobile page boundaries", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  }
});

test("landing pauses media and morphing when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("[data-landing-motion]")).toHaveAttribute("data-motion", "off");
  await expect
    .poll(() =>
      page
        .locator("[data-landing-video]")
        .evaluateAll((videos) => videos.every((video) => (video as HTMLVideoElement).paused)),
    )
    .toBe(true);
  const animationNames = await page
    .locator("[data-morph-shape]")
    .evaluateAll((shapes) => shapes.map((shape) => getComputedStyle(shape).animationName));
  expect(animationNames.every((name) => name === "none")).toBe(true);

  const cta = page.locator('a[data-premium-cta="components"]').first();
  await cta.hover();
  const reducedCta = await cta.evaluate((element) => ({
    transform: getComputedStyle(element).transform,
    contourTransition: getComputedStyle(element, "::before").transitionDuration,
    sheenDisplay: getComputedStyle(element, "::after").display,
    arrowTransition: getComputedStyle(element.querySelector("svg") as SVGElement)
      .transitionDuration,
  }));
  expect(reducedCta.transform).toBe("none");
  expect(reducedCta.contourTransition).toBe("0s");
  expect(reducedCta.sheenDisplay).toBe("none");
  expect(reducedCta.arrowTransition).toBe("0s");
});

test("canonical components route keeps all recipes and removes comparison framing", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /Explore 40 Components/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/components$/);
  await expect(page.locator('[data-catalog-mode="product"]')).toBeVisible();
  await expect(page.locator(".atlas-nav")).toHaveCount(0);
  await expect(page.locator(".atlas-specimen[data-component]")).toHaveCount(40);
  await expect(page.locator("[data-component-name]")).toHaveCount(40);
  await expect(
    page.getByText(/Rank 01|Adaptive Hybrid|Native CSS|Spectral WebGL|Weighted library score/),
  ).toHaveCount(0);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Glass is not a blur. It’s an interface system.",
    }),
  ).toBeVisible();
});
