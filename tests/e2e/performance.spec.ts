import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __oguiLongTasks?: number[];
    __oguiLongTaskSupported?: boolean;
  }
}

function percentile(values: number[], percentileValue: number) {
  const sorted = values.toSorted((left, right) => left - right);
  const index = Math.min(Math.floor(sorted.length * percentileValue), sorted.length - 1);
  return sorted[index] ?? 0;
}

test("browser performance and resource lifecycle stay within research budgets", async ({
  page,
  browserName,
}) => {
  test.skip(
    process.env.OPENGLASS_UI_PERF !== "1",
    "Run through pnpm bench:browser so the reference probe is isolated",
  );
  test.skip(browserName !== "chromium", "Chromium is the isolated reference performance host");
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    window.__oguiLongTasks = [];
    window.__oguiLongTaskSupported = false;
    try {
      const observer = new PerformanceObserver((list) => {
        window.__oguiLongTasks?.push(...list.getEntries().map((entry) => entry.duration));
      });
      observer.observe({ entryTypes: ["longtask"] });
      window.__oguiLongTaskSupported = true;
    } catch {
      // Firefox and WebKit do not currently expose the Long Tasks API.
    }
  });

  await page.goto("/experiments/css");
  await expect(page.locator(".engine-surface").first()).toBeVisible();

  const inputUpdateSamples = await page.evaluate(async () => {
    const surface = document.querySelector<HTMLElement>(".engine-surface");
    if (!surface) {
      throw new Error("Unable to locate the material performance probe.");
    }

    const samples: number[] = [];
    for (const [label, material] of [
      ["Clear", "clear"],
      ["Regular", "regular"],
      ["Frosted", "frosted"],
      ["Clear", "clear"],
      ["Regular", "regular"],
      ["Frosted", "frosted"],
    ]) {
      const control = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
        (button) => button.textContent?.trim() === label,
      );
      if (!control) {
        throw new Error(`Unable to locate the ${label} material control.`);
      }
      const start = performance.now();
      control.click();
      while (surface.dataset.oguiMaterial !== material) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      samples.push(performance.now() - start);
    }
    return samples;
  });
  const inputUpdateMs = percentile(inputUpdateSamples, 0.95);

  await page.goto("/experiments/webgl");
  const webglSurface = page.locator("[data-ogui-webgl-surface]");
  await expect(webglSurface).toBeAttached();
  await expect(webglSurface).toHaveAttribute("data-ogui-webgl-status", "ready");
  const rendererStatus = await webglSurface.getAttribute("data-ogui-webgl-status");
  const startupLongTaskProbe = await page.evaluate(() => {
    const durations = window.__oguiLongTasks ?? [];
    window.__oguiLongTasks = [];
    return {
      durations,
      supported: window.__oguiLongTaskSupported ?? false,
    };
  });

  const frameDurations = await page.evaluate(async () => {
    const timestamps: number[] = [];
    await new Promise<void>((resolve) => {
      const sample = (timestamp: number) => {
        timestamps.push(timestamp);
        if (timestamps.length >= 61) {
          resolve();
          return;
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    return timestamps
      .slice(1)
      .map((timestamp, index) => timestamp - (timestamps[index] ?? timestamp));
  });

  await page.getByRole("link", { name: "Experiment 01: CSS Material" }).click();
  await expect(page).toHaveURL(/\/experiments\/css$/);
  await expect(page.locator("[data-ogui-webgl-surface]")).toHaveCount(0);
  const released = await page.evaluate(() => ({
    instrumentVideos: document.querySelectorAll(".instrument video").length,
    webglSurfaces: document.querySelectorAll("[data-ogui-webgl-surface]").length,
  }));
  const longTaskProbe = await page.evaluate(() => ({
    durations: window.__oguiLongTasks ?? [],
    supported: window.__oguiLongTaskSupported ?? false,
  }));

  const report = {
    measuredAt: new Date().toISOString(),
    browser: browserName,
    inputUpdateMs: Number(inputUpdateMs.toFixed(3)),
    inputUpdateSamples: inputUpdateSamples.map((sample) => Number(sample.toFixed(3))),
    frames: {
      count: frameDurations.length,
      medianMs: Number(percentile(frameDurations, 0.5).toFixed(3)),
      p95Ms: Number(percentile(frameDurations, 0.95).toFixed(3)),
      maxMs: Number(Math.max(...frameDurations).toFixed(3)),
    },
    longTasks: {
      supported: longTaskProbe.supported,
      count: longTaskProbe.durations.length,
      maxMs: Number(Math.max(0, ...longTaskProbe.durations).toFixed(3)),
    },
    startupLongTasks: {
      supported: startupLongTaskProbe.supported,
      count: startupLongTaskProbe.durations.length,
      maxMs: Number(Math.max(0, ...startupLongTaskProbe.durations).toFixed(3)),
    },
    rendererStatus,
    released,
  };
  const reportDirectory = path.join("artifacts", "performance");
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(reportDirectory, `${browserName}.json`),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  expect(inputUpdateMs).toBeLessThan(100);
  expect(percentile(frameDurations, 0.95)).toBeLessThan(60);
  expect(report.longTasks.maxMs).toBeLessThan(100);
  expect(released).toEqual({ instrumentVideos: 0, webglSurfaces: 0 });
});
