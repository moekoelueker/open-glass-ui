/**
 * Rasterizes the brand SVGs into the PNGs the web needs.
 *
 * Social platforms (X, Facebook, LinkedIn, Slack) do not render SVG `og:image`,
 * and iOS home-screen icons must be PNG, so the vector sources are the editable
 * originals and the PNGs are generated. Re-run after changing brand copy:
 *
 *   node scripts/generate-brand-assets.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const brand = join(root, "apps", "showcase", "brand");
const publicDirectory = join(root, "apps", "showcase", "public");

const targets = [
  { source: join(brand, "og-image.svg"), output: "og-image.png", width: 1200, height: 630 },
  {
    source: join(publicDirectory, "favicon.svg"),
    output: "apple-touch-icon.png",
    width: 180,
    height: 180,
  },
  { source: join(publicDirectory, "favicon.svg"), output: "favicon-32.png", width: 32, height: 32 },
];

const browser = await chromium.launch();

try {
  for (const { source, output, width, height } of targets) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>
         html,body{margin:0;padding:0;overflow:hidden;background:#0b0e10}
         svg{display:block;width:${width}px;height:${height}px}
       </style></head><body>${readFileSync(source, "utf8")}</body></html>`,
      { waitUntil: "load" },
    );
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(publicDirectory, output) });
    await page.close();
    console.log(`${output} ${width}x${height}`);
  }
} finally {
  await browser.close();
}
