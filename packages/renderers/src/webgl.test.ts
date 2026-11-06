import { getMaterialPreset } from "@open-glass-ui/core";
import { describe, expect, it } from "vitest";
import { MAX_WEBGL_LENSES, packLensUniforms, WebGLGlassRenderer, type WebGLLens } from "./webgl";

function lens(index: number): WebGLLens {
  return {
    x: 100 + index * 10,
    y: 80,
    width: 180,
    height: 72,
    radius: 0.5,
    material: getMaterialPreset("clear"),
  };
}

describe("WebGL lens uniforms", () => {
  it("packs geometry and coherent material values", () => {
    const packed = packLensUniforms([lens(0)]);

    expect(packed.count).toBe(1);
    expect([...packed.rectangles.slice(0, 4)]).toEqual([100, 80, 90, 36]);
    expect(packed.optics[0]).toBeCloseTo(getMaterialPreset("clear").thickness);
    expect(packed.optics[1]).toBeCloseTo(getMaterialPreset("clear").ior);
    expect(packed.surface[0]).toBeCloseTo(getMaterialPreset("clear").edgeStrength);
  });

  it("enforces the shader lens limit", () => {
    const packed = packLensUniforms(
      Array.from({ length: MAX_WEBGL_LENSES + 3 }, (_, index) => lens(index)),
    );

    expect(packed.count).toBe(MAX_WEBGL_LENSES);
    expect(packed.rectangles).toHaveLength(MAX_WEBGL_LENSES * 4);
  });

  it("sanitizes non-finite dimensions and material controls", () => {
    const invalid = lens(0);
    invalid.width = Number.NaN;
    invalid.height = Number.POSITIVE_INFINITY;
    invalid.radius = -10;
    invalid.material = {
      thickness: Number.NaN,
      ior: Number.NEGATIVE_INFINITY,
      dispersion: 5,
      edgeStrength: -1,
      bevel: 0.6,
      frost: 4,
    };
    const packed = packLensUniforms([invalid]);

    for (const value of [...packed.rectangles, ...packed.optics, ...packed.surface]) {
      expect(Number.isFinite(value)).toBe(true);
    }
    expect(packed.rectangles[2]).toBeGreaterThanOrEqual(1);
    expect(packed.optics[2]).toBeLessThanOrEqual(0.08);
    expect(packed.surface[0]).toBe(0);
    expect(packed.surface[1]).toBe(1);
  });
});

describe("WebGLGlassRenderer.clear", () => {
  function fakeCanvas(options: { lost?: boolean } = {}) {
    const calls: Array<[string, unknown[]]> = [];
    const overrides: Record<string, unknown> = {
      getShaderParameter: () => true,
      getProgramParameter: () => true,
      getAttribLocation: () => 0,
      isContextLost: () => options.lost === true,
    };
    const gl = new Proxy(
      {},
      {
        get(_target, property: string) {
          if (property in overrides) {
            return overrides[property];
          }
          return (...args: unknown[]) => {
            calls.push([property, args]);
            return {};
          };
        },
      },
    );
    const canvas = {
      width: 320,
      height: 180,
      getContext: () => gl,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as HTMLCanvasElement;
    return { canvas, calls, options };
  }

  it("clears the default framebuffer to transparent", () => {
    const { canvas, calls } = fakeCanvas();
    const renderer = new WebGLGlassRenderer(canvas);
    calls.length = 0;

    renderer.clear();

    expect(calls.find(([name]) => name === "clearColor")?.[1]).toEqual([0, 0, 0, 0]);
    expect(calls.find(([name]) => name === "viewport")?.[1]).toEqual([0, 0, 320, 180]);
    expect(calls.some(([name]) => name === "clear")).toBe(true);
  });

  it("does nothing once disposed or while the context is lost", () => {
    const disposed = fakeCanvas();
    const renderer = new WebGLGlassRenderer(disposed.canvas);
    renderer.dispose();
    disposed.calls.length = 0;
    renderer.clear();
    expect(disposed.calls).toEqual([]);

    const lost = fakeCanvas();
    const lostRenderer = new WebGLGlassRenderer(lost.canvas);
    lost.options.lost = true;
    lost.calls.length = 0;
    lostRenderer.clear();
    expect(lost.calls).toEqual([]);
  });
});
