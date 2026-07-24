import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  createOpticsCacheKey,
  generateDisplacementMap,
  getMaterialPreset,
  type LensGeometry,
  signedDistance,
  surfaceNormal,
} from "./index";

const geometries: LensGeometry[] = [
  { kind: "circle", width: 120, height: 120 },
  { kind: "capsule", width: 180, height: 72 },
  { kind: "rounded-rect", width: 180, height: 112, cornerRadius: 28 },
  { kind: "superellipse", width: 168, height: 112, exponent: 4.5 },
];

function vectorMagnitude(channel: number) {
  return Math.abs(channel - 128);
}

describe("signed-distance geometry", () => {
  it.each(geometries)("$kind has negative interior and positive exterior", (geometry) => {
    expect(signedDistance({ x: 0, y: 0 }, geometry)).toBeLessThan(0);
    expect(signedDistance({ x: geometry.width, y: geometry.height }, geometry)).toBeGreaterThan(0);
  });

  it.each(geometries)("$kind is symmetric around both axes", (geometry) => {
    fc.assert(
      fc.property(
        fc.double({
          min: -geometry.width,
          max: geometry.width,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        fc.double({
          min: -geometry.height,
          max: geometry.height,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        (x, y) => {
          const distance = signedDistance({ x, y }, geometry);

          expect(signedDistance({ x: -x, y }, geometry)).toBeCloseTo(distance, 8);
          expect(signedDistance({ x, y: -y }, geometry)).toBeCloseTo(distance, 8);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("clamps invalid shape parameters instead of producing non-finite output", () => {
    const geometry: LensGeometry = {
      kind: "superellipse",
      width: -1,
      height: Number.NaN,
      exponent: Number.POSITIVE_INFINITY,
    };

    expect(Number.isFinite(signedDistance({ x: 0, y: 0 }, geometry))).toBe(true);
  });
});

describe("surface normals", () => {
  const geometry: LensGeometry = {
    kind: "rounded-rect",
    width: 180,
    height: 112,
    cornerRadius: 28,
  };

  it("faces forward at the center and tilts toward the edge", () => {
    const center = surfaceNormal({ x: 0, y: 0 }, geometry, 0.72);
    const edge = surfaceNormal({ x: 82, y: 0 }, geometry, 0.72);

    expect(center.z).toBeGreaterThan(0.99);
    expect(Math.abs(center.x)).toBeLessThan(0.01);
    expect(edge.z).toBeLessThan(center.z);
    expect(edge.x).toBeGreaterThan(0);
  });

  it("returns a unit-length finite vector", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -56, max: 56, noNaN: true, noDefaultInfinity: true }),
        (x, y) => {
          const normal = surfaceNormal({ x, y }, geometry, 0.72);
          const length = Math.hypot(normal.x, normal.y, normal.z);

          expect(Number.isFinite(length)).toBe(true);
          expect(length).toBeCloseTo(1, 6);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe("displacement representation", () => {
  const geometry: LensGeometry = {
    kind: "rounded-rect",
    width: 96,
    height: 64,
    cornerRadius: 18,
  };

  it("is deterministic, bounded, and neutral outside the lens", () => {
    const material = getMaterialPreset("regular");
    const first = generateDisplacementMap({ width: 48, height: 32, geometry, material });
    const second = generateDisplacementMap({ width: 48, height: 32, geometry, material });

    expect(first.data).toEqual(second.data);
    expect(first.data).toHaveLength(48 * 32 * 4);

    for (const channel of first.data) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }

    expect([...first.data.slice(0, 4)]).toEqual([128, 128, 0, 0]);
  });

  it("encodes an opaque center, edge response, and directional displacement", () => {
    const map = generateDisplacementMap({
      width: 48,
      height: 32,
      geometry,
      material: getMaterialPreset("clear"),
    });
    const centerOffset = (Math.floor(map.height / 2) * map.width + Math.floor(map.width / 2)) * 4;
    const rightOffset = (Math.floor(map.height / 2) * map.width + map.width - 5) * 4;

    expect(map.data[centerOffset + 3]).toBeGreaterThan(240);
    expect(map.data[rightOffset]).toBeGreaterThan(128);
    expect(map.data[rightOffset + 2]).toBeGreaterThan(0);
  });

  it("increases displacement monotonically with material thickness", () => {
    const thin = generateDisplacementMap({
      width: 48,
      height: 32,
      geometry,
      material: { ...getMaterialPreset("clear"), thickness: 0.3 },
    });
    const thick = generateDisplacementMap({
      width: 48,
      height: 32,
      geometry,
      material: { ...getMaterialPreset("clear"), thickness: 0.9 },
    });
    const sampleOffset = (Math.floor(thin.height / 2) * thin.width + thin.width - 8) * 4;

    expect(vectorMagnitude(thick.data[sampleOffset] ?? 128)).toBeGreaterThan(
      vectorMagnitude(thin.data[sampleOffset] ?? 128),
    );
  });

  it("creates stable cache keys from equivalent inputs", () => {
    const material = getMaterialPreset("frosted");
    const first = createOpticsCacheKey({ width: 48, height: 32, geometry, material });
    const second = createOpticsCacheKey({
      material: { ...material },
      geometry: { ...geometry },
      height: 32,
      width: 48,
    });

    expect(first).toBe(second);
  });
});
