import { getMaterialPreset } from "@open-glass-ui/core";
import { describe, expect, it } from "vitest";
import { createCssMaterialStyle, createCssMaterialTokens } from "./index";

describe("semantic CSS materials", () => {
  it("gives clear, regular, and frosted presets different optical densities", () => {
    const clear = createCssMaterialTokens({
      material: "clear",
      tone: "dark",
      backdropFilter: true,
    });
    const regular = createCssMaterialTokens({
      material: "regular",
      tone: "dark",
      backdropFilter: true,
    });
    const frosted = createCssMaterialTokens({
      material: "frosted",
      tone: "dark",
      backdropFilter: true,
    });

    expect(clear["--ogui-material-filter"]).toContain("blur(10px)");
    expect(regular["--ogui-material-filter"]).toContain("blur(22px)");
    expect(frosted["--ogui-material-filter"]).toContain("blur(34px)");
  });

  it("uses an opaque intentional surface when transparency is reduced", () => {
    const tokens = createCssMaterialTokens({
      material: "clear",
      tone: "dark",
      reducedTransparency: true,
    });

    expect(tokens["--ogui-material-background"]).toBe("#15191c");
    expect(tokens["--ogui-material-filter"]).toBe("none");
  });

  it("uses system colors and no optical decoration in forced-colors mode", () => {
    const tokens = createCssMaterialTokens({
      material: "frosted",
      tone: "light",
      forcedColors: true,
    });
    const style = createCssMaterialStyle(tokens);

    expect(style.background).toBe("Canvas");
    expect(style.color).toBe("CanvasText");
    expect(style.boxShadow).toBe("none");
    expect(style.backdropFilter).toBe("none");
  });

  it("increases opacity instead of dropping content when backdrop blur is unsupported", () => {
    const tokens = createCssMaterialTokens({
      material: "regular",
      tone: "light",
      backdropFilter: false,
    });

    expect(tokens["--ogui-material-background"]).toContain("/ 0.94)");
    expect(tokens["--ogui-material-filter"]).toBe("none");
  });
});

const blurOf = (filter: string) => Number(/blur\(([\d.]+)px\)/.exec(filter)?.[1]);
const alphaOf = (background: string) => Number(/\/\s*([\d.]+)\)/.exec(background)?.[1]);

describe("frost override", () => {
  it("leaves the preset tokens untouched when no frost is supplied", () => {
    for (const material of ["clear", "regular", "frosted"] as const) {
      const base = createCssMaterialTokens({ material, tone: "dark" });
      const explicit = createCssMaterialTokens({
        material,
        tone: "dark",
        frost: getMaterialPreset(material).frost,
      });

      // Passing a preset's own frost must reproduce that preset exactly, so the
      // interpolation anchors cannot drift away from the named materials.
      expect(blurOf(explicit["--ogui-material-filter"])).toBeCloseTo(
        blurOf(base["--ogui-material-filter"]),
        2,
      );
      expect(alphaOf(explicit["--ogui-material-background"])).toBeCloseTo(
        alphaOf(base["--ogui-material-background"]),
        2,
      );
    }
  });

  it("moves blur and opacity monotonically with frost", () => {
    const blurs = [0, 0.15, 0.35, 0.55, 0.8, 1].map((frost) =>
      blurOf(
        createCssMaterialTokens({ material: "regular", tone: "dark", frost })[
          "--ogui-material-filter"
        ],
      ),
    );

    for (let index = 1; index < blurs.length; index += 1) {
      expect(blurs[index]).toBeGreaterThanOrEqual(blurs[index - 1] as number);
    }
    expect(blurs.at(-1)).toBeGreaterThan(blurs[0] as number);
  });

  it("keeps the material's own hue when frost changes", () => {
    const light = createCssMaterialTokens({ material: "clear", tone: "light", frost: 0.9 });
    // clear/light is rgb(255 252 244 / a); only the alpha may move.
    expect(light["--ogui-material-background"]).toMatch(/^rgb\(255 252 244 \//);
  });

  it("never reintroduces translucency in accessibility states", () => {
    const forced = createCssMaterialTokens({
      material: "clear",
      tone: "dark",
      frost: 0.9,
      forcedColors: true,
    });
    expect(forced["--ogui-material-filter"]).toBe("none");
    expect(forced["--ogui-material-background"]).toBe("Canvas");

    const reduced = createCssMaterialTokens({
      material: "clear",
      tone: "dark",
      frost: 0.9,
      reducedTransparency: true,
    });
    expect(reduced["--ogui-material-filter"]).toBe("none");
  });

  it("clamps out-of-range frost instead of producing nonsense", () => {
    const low = createCssMaterialTokens({ material: "regular", tone: "dark", frost: -5 });
    const high = createCssMaterialTokens({ material: "regular", tone: "dark", frost: 9 });
    expect(blurOf(low["--ogui-material-filter"])).toBeGreaterThan(0);
    expect(alphaOf(high["--ogui-material-background"])).toBeLessThanOrEqual(1);
  });
});
