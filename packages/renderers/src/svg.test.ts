import { generateDisplacementMap, getMaterialPreset } from "@prism-lab/core";
import { describe, expect, it, vi } from "vitest";
import {
  createStableFilterId,
  createSvgDisplacementFilterSpec,
  encodeDisplacementMap,
} from "./index";

const material = getMaterialPreset("clear");
const map = generateDisplacementMap({
  width: 32,
  height: 20,
  geometry: { kind: "capsule", width: 64, height: 40 },
  material,
});

describe("SVG displacement resources", () => {
  it("creates stable, CSS-safe IDs that change with map content", () => {
    expect(createStableFilterId("Hero Lens!", map.cacheKey)).toMatch(/^hero-lens-[a-z0-9]+$/);
    expect(createStableFilterId("Hero Lens!", map.cacheKey)).toBe(
      createStableFilterId("Hero Lens!", map.cacheKey),
    );
    expect(createStableFilterId("Hero Lens!", `${map.cacheKey}-changed`)).not.toBe(
      createStableFilterId("Hero Lens!", map.cacheKey),
    );
  });

  it("encodes RGB channel separation and conservative filter bounds", () => {
    const spec = createSvgDisplacementFilterSpec(
      "lens",
      map,
      "data:image/png;base64,map",
      material,
    );

    expect(spec.redScale).toBeGreaterThan(spec.greenScale);
    expect(spec.greenScale).toBeGreaterThan(spec.blueScale);
    expect(spec.x).toBe("-18%");
    expect(spec.width).toBe("136%");
    expect(spec.specularOpacity).toBe(material.edgeStrength);
  });

  it("encodes a map through an injected canvas without browser globals", () => {
    const putImageData = vi.fn();
    const createImageData = vi.fn((width: number, height: number) => ({
      colorSpace: "srgb" as const,
      data: new Uint8ClampedArray(width * height * 4),
      height,
      width,
    }));
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ createImageData, putImageData })),
      toDataURL: vi.fn(() => "data:image/png;base64,test"),
    };

    expect(encodeDisplacementMap(map, () => canvas)).toBe("data:image/png;base64,test");
    expect(canvas.width).toBe(map.width);
    expect(canvas.height).toBe(map.height);
    expect(createImageData).toHaveBeenCalledWith(map.width, map.height);
    expect(putImageData).toHaveBeenCalledOnce();
  });
});
