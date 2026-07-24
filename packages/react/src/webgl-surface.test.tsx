import { getMaterialPreset } from "@prism-lab/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GlassProvider } from "./provider";
import { scaleWebGLLenses, WebGLGlassSurface } from "./webgl-surface";

describe("scaleWebGLLenses", () => {
  it("scales CSS pixel coordinates while preserving material values", () => {
    const material = getMaterialPreset("clear");
    const [lens] = scaleWebGLLenses(
      [{ x: 20, y: 30, width: 100, height: 44, radius: 0.5, material }],
      2,
    );

    expect(lens).toMatchObject({
      x: 40,
      y: 60,
      width: 200,
      height: 88,
      radius: 0.5,
      material,
    });
  });

  it("bounds invalid and excessive pixel ratios", () => {
    const lens = {
      x: 10,
      y: 10,
      width: 20,
      height: 20,
      radius: 0.5,
      material: getMaterialPreset("regular"),
    };

    expect(scaleWebGLLenses([lens], Number.NaN)[0]?.width).toBe(20);
    expect(scaleWebGLLenses([lens], 8)[0]?.width).toBe(60);
  });
});

describe("WebGLGlassSurface", () => {
  it("renders an SSR-safe canvas without claiming WebGL support", () => {
    const sourceRef = { current: null };
    const markup = renderToStaticMarkup(
      <GlassProvider>
        <WebGLGlassSurface sourceRef={sourceRef} lenses={[]} className="surface" />
      </GlassProvider>,
    );

    expect(markup).toContain("<canvas");
    expect(markup).toContain('data-prism-webgl-status="idle"');
    expect(markup).toContain('aria-hidden="true"');
  });
});
