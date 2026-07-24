import { describe, expect, it } from "vitest";
import { applyQualityToMapInput, QUALITY_PROFILES, resolveMapDimensions } from "./index";

describe("optics quality tiers", () => {
  it("increases resolution and dispersion samples monotonically", () => {
    const low = resolveMapDimensions(320, 180, "low");
    const medium = resolveMapDimensions(320, 180, "medium");
    const high = resolveMapDimensions(320, 180, "high");

    expect(low.width).toBeLessThan(medium.width);
    expect(medium.width).toBeLessThan(high.width);
    expect(QUALITY_PROFILES.low.dispersionSamples).toBeLessThan(
      QUALITY_PROFILES.medium.dispersionSamples,
    );
    expect(QUALITY_PROFILES.medium.dispersionSamples).toBeLessThan(
      QUALITY_PROFILES.high.dispersionSamples,
    );
  });

  it.each(["low", "medium", "high"] as const)(
    "keeps %s maps within its profile bounds and source aspect ratio",
    (quality) => {
      const dimensions = resolveMapDimensions(2000, 1000, quality);
      const profile = QUALITY_PROFILES[quality];

      expect(Math.max(dimensions.width, dimensions.height)).toBeLessThanOrEqual(
        profile.maximumDimension,
      );
      expect(Math.min(dimensions.width, dimensions.height)).toBeGreaterThanOrEqual(
        profile.minimumDimension,
      );
      expect(dimensions.width / dimensions.height).toBeCloseTo(2, 1);
    },
  );

  it("returns a new map input without mutating geometry or material", () => {
    const input = {
      width: 320,
      height: 180,
      geometry: { kind: "capsule" as const, width: 320, height: 180 },
      material: {
        thickness: 0.6,
        ior: 1.46,
        dispersion: 0.01,
        edgeStrength: 0.4,
        bevel: 0.6,
        frost: 0.2,
      },
    };
    const resolved = applyQualityToMapInput(input, "medium");

    expect(resolved).not.toBe(input);
    expect(resolved.geometry).toBe(input.geometry);
    expect(resolved.material).toBe(input.material);
    expect(input.width).toBe(320);
  });
});
