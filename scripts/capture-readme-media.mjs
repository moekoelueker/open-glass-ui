#!/usr/bin/env node
/**
 * Regenerates the README and repository images in docs/media from the live
 * showcase, so the pictures always show the design that actually ships.
 *
 * Start the showcase first (`pnpm dev`), then run `pnpm capture:media`.
 * Captures are deterministic apart from the looping hero video, which is
 * paused on a fixed frame.
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const BASE = process.env.OPENGLASS_UI_BASE_URL ?? "http://127.0.0.1:4173";
const OUT = fileURLToPath(new URL("../docs/media/", import.meta.url));

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const video of document.querySelectorAll("video")) {
      video.pause();
      video.currentTime = 1;
    }
  });
  await page.waitForTimeout(900);
}

async function shoot(name, target) {
  await target.screenshot({ path: `${OUT}${name}.png` });
  console.log(`docs/media/${name}.png`);
}

async function strip(browser, name, shots, columns = shots.length, background = "#07090b") {
  // Composes several element captures side by side on one canvas.
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const cells = shots
    .map(
      ({ src, caption }) =>
        `<figure><img src="data:image/png;base64,${src}"><figcaption>${caption}</figcaption></figure>`,
    )
    .join("");
  await page.setContent(`<!doctype html><style>
    body{margin:0;background:${background};font:600 22px -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;color:#c9ced4}
    main{display:grid;grid-template-columns:repeat(${columns},420px);gap:32px 28px;padding:36px;width:max-content}
    figure{margin:0;display:grid;gap:14px;justify-items:center}
    img{display:block;width:420px;border-radius:28px}
    figcaption{letter-spacing:.02em}
  </style><main>${cells}</main>`);
  await page.waitForTimeout(300);
  await page.locator("main").screenshot({ path: `${OUT}${name}.png` });
  console.log(`docs/media/${name}.png`);
  await page.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const wide = await browser.newPage({
    viewport: { width: 1560, height: 1000 },
    deviceScaleFactor: 1.25,
    colorScheme: "dark",
  });

  // 1. Hero: the same live scene, classic on the left and liquid on the right.
  await wide.goto(`${BASE}/compare?split=50&wallpaper=aurora`);
  await settle(wide);
  await shoot("hero", wide.locator(".compare-frame"));

  // 2. Liquid in light appearance.
  await wide.goto(`${BASE}/compare?split=0&appearance=light&wallpaper=dawn`);
  await settle(wide);
  await shoot("liquid-light", wide.locator(".compare-frame"));

  // 3. Social preview: 1280x640, real components over the project's photo
  // (the /og composition). GitHub caps social previews at 1 MB.
  const social = await browser.newPage({
    viewport: { width: 1280, height: 640 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });
  await social.goto(`${BASE}/og`);
  await settle(social);
  await social.locator(".og-canvas").screenshot({ path: `${OUT}social-preview.png` });
  console.log("docs/media/social-preview.png");
  await social.close();

  // 4. Looks and 5. light direction: the same card, re-art-directed.
  const card = await browser.newPage({
    viewport: { width: 1560, height: 1000 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const cardShot = async (look, angle) => {
    await card.goto(`${BASE}/compare?split=0&wallpaper=photo`);
    await settle(card);
    if (look) await card.getByRole("button", { name: look, exact: true }).first().click();
    if (angle !== undefined) {
      await card.getByRole("slider", { name: "Light direction" }).fill(String(angle));
    }
    await card.waitForTimeout(400);
    const target = card.locator('.compare-scene[data-ogui-design="liquid"] .compare-card');
    await target.scrollIntoViewIfNeeded();
    return (await target.screenshot()).toString("base64");
  };
  const looks = [];
  for (const look of ["Liquid", "Frosted", "Clear", "Smoked", "Lensed"]) {
    looks.push({ src: await cardShot(look), caption: look });
  }
  await strip(browser, "looks", looks, 3);
  const angles = [];
  for (const [angle, caption] of [
    [270, "Light from the left"],
    [340, "Default: top, left of centre"],
    [40, "Light from the top right"],
  ]) {
    angles.push({ src: await cardShot(undefined, angle), caption });
  }
  await strip(browser, "light-direction", angles);
  await card.close();

  // 6. The component catalog in the new design, one image per category.
  const catalog = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1.25,
    colorScheme: "dark",
  });
  await catalog.goto(`${BASE}/components?appearance=dark&preset=neutral`);
  await settle(catalog);
  const categories = catalog.locator("section.atlas-category");
  for (let index = 0; index < 4; index += 1) {
    const category = categories.nth(index);
    await category.scrollIntoViewIfNeeded();
    await catalog.waitForTimeout(500);
    await shoot(`components-${index + 1}`, category);
  }
  const studio = catalog.locator("section.atlas-theme-studio");
  await studio.scrollIntoViewIfNeeded();
  await catalog.waitForTimeout(400);
  await shoot("theming", studio);
  await catalog.close();

  // 7. Material anatomy from the landing page.
  const landing = await browser.newPage({
    viewport: { width: 1480, height: 1000 },
    deviceScaleFactor: 1.25,
    colorScheme: "dark",
  });
  await landing.goto(`${BASE}/`);
  await settle(landing);
  // The sticky navigation would otherwise float over the captured section.
  await landing.addStyleTag({ content: ".landing-header-wrap { display: none !important; }" });
  const materials = landing.locator("#materials");
  await materials.scrollIntoViewIfNeeded();
  await landing.waitForTimeout(600);
  await shoot("materials", materials);
  await landing.close();

  await browser.close();
}

await main();
