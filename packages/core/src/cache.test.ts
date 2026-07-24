import { describe, expect, it } from "vitest";
import {
  type DisplacementMapInput,
  generateDisplacementMap,
  generateDisplacementMapAsync,
  getMaterialPreset,
  OpticsMapCache,
} from "./index";

const input: DisplacementMapInput = {
  width: 120,
  height: 72,
  geometry: {
    kind: "capsule",
    width: 120,
    height: 72,
  },
  material: getMaterialPreset("regular"),
};

describe("optics map cache", () => {
  it("returns the same map instance for a cache hit", () => {
    const cache = new OpticsMapCache();
    const first = cache.getOrCreate(input, "medium");
    const second = cache.getOrCreate({ ...input }, "medium");

    expect(second).toBe(first);
    expect(cache.stats()).toMatchObject({
      entries: 1,
      hits: 1,
      misses: 1,
    });
  });

  it("evicts least-recently-used maps to stay inside its byte budget", () => {
    const cache = new OpticsMapCache(3_200);
    const first = cache.getOrCreate(input, "low");
    const second = cache.getOrCreate(
      {
        ...input,
        material: { ...input.material, thickness: 0.9 },
      },
      "low",
    );
    const firstAgain = cache.getOrCreate(input, "low");

    expect(first.data.byteLength).toBeLessThanOrEqual(3_200);
    expect(second.data.byteLength).toBeLessThanOrEqual(3_200);
    expect(firstAgain).not.toBe(first);
    expect(cache.stats().bytes).toBeLessThanOrEqual(cache.stats().maximumBytes);
    expect(cache.stats().misses).toBe(3);
  });

  it("clears retained bytes without resetting diagnostic counters", () => {
    const cache = new OpticsMapCache();
    cache.getOrCreate(input, "low");
    cache.clear();

    expect(cache.stats()).toMatchObject({
      entries: 0,
      bytes: 0,
      misses: 1,
    });
  });
});

describe("worker-safe asynchronous generation", () => {
  it("matches synchronous output at the same resolved quality", async () => {
    const asyncMap = await generateDisplacementMapAsync(input, { quality: "high" });
    const syncMap = generateDisplacementMap({
      ...input,
      width: asyncMap.width,
      height: asyncMap.height,
    });

    expect(asyncMap.data).toEqual(syncMap.data);
    expect(asyncMap.cacheKey).toBe(syncMap.cacheKey);
  });

  it("honors an already-aborted signal", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      generateDisplacementMapAsync(input, { signal: controller.signal }),
    ).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});
