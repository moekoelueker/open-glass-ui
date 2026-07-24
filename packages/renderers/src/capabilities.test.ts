import { describe, expect, it } from "vitest";
import {
  type CapabilityProbe,
  detectRendererCapabilities,
  type RendererCapabilities,
  selectRenderer,
} from "./index";

function probe(overrides: Partial<CapabilityProbe> = {}): CapabilityProbe {
  return {
    supports: () => true,
    matches: () => false,
    hasSvgDisplacementElement: () => true,
    hasWebGL2: () => true,
    devicePixelRatio: 2,
    hardwareConcurrency: 8,
    ...overrides,
  };
}

const capable: RendererCapabilities = {
  backdropFilter: true,
  backdropUrlSyntax: true,
  svgFilterElements: true,
  webgl2: true,
  reducedMotion: false,
  reducedTransparency: false,
  forcedColors: false,
  devicePixelRatio: 2,
  hardwareConcurrency: 8,
};

describe("renderer capability policy", () => {
  it("returns an SSR-safe conservative snapshot without a probe", () => {
    expect(detectRendererCapabilities(undefined)).toEqual({
      backdropFilter: false,
      backdropUrlSyntax: false,
      svgFilterElements: false,
      webgl2: false,
      reducedMotion: false,
      reducedTransparency: false,
      forcedColors: false,
      devicePixelRatio: 1,
      hardwareConcurrency: 1,
    });
  });

  it("describes syntax and actual context capabilities separately", () => {
    const capabilities = detectRendererCapabilities(
      probe({
        supports: (property, value) => property === "backdrop-filter" && value === "blur(1px)",
        hasWebGL2: () => false,
      }),
    );

    expect(capabilities.backdropFilter).toBe(true);
    expect(capabilities.backdropUrlSyntax).toBe(false);
    expect(capabilities.webgl2).toBe(false);
    expect(capabilities.svgFilterElements).toBe(true);
  });

  it("selects WebGL2 for controlled media and SDF/SVG for DOM", () => {
    expect(selectRenderer({ source: "media", capabilities: capable })).toEqual({
      renderer: "webgl2",
      reason: "media-webgl",
    });
    expect(selectRenderer({ source: "dom", capabilities: capable })).toEqual({
      renderer: "sdf-svg",
      reason: "dom-svg",
    });
  });

  it("honors explicit supported approaches and rejects impossible ones", () => {
    expect(
      selectRenderer({ source: "dom", preference: "organic-svg", capabilities: capable }),
    ).toEqual({
      renderer: "organic-svg",
      reason: "explicit",
    });
    expect(selectRenderer({ source: "dom", preference: "webgl2", capabilities: capable })).toEqual({
      renderer: "css",
      reason: "capability-fallback",
    });
  });

  it.each([
    { forcedColors: true, reducedTransparency: false },
    { forcedColors: false, reducedTransparency: true },
  ])("uses an opaque CSS strategy for accessibility adaptation", (accessibility) => {
    expect(
      selectRenderer({
        source: "media",
        capabilities: { ...capable, ...accessibility },
      }),
    ).toEqual({
      renderer: "css",
      reason: "accessibility-fallback",
    });
  });
});
