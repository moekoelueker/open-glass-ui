import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  createGlassTheme,
  createGlassThemeTokens,
  readableForeground,
} from "./theme";

describe("glass theme tokens", () => {
  it("uses monochrome high-contrast defaults in both appearances", () => {
    const dark = createGlassTheme("dark");
    const light = createGlassTheme("light");

    expect(dark.accent).toBe("#f4f3ee");
    expect(dark.accentContrast).toBeGreaterThanOrEqual(7);
    expect(light.accent).toBe("#151719");
    expect(light.accentContrast).toBeGreaterThanOrEqual(7);
  });

  it("derives a readable foreground for custom accents", () => {
    const cobalt = createGlassTheme("dark", { accent: "#5b7cff" });
    const amber = createGlassTheme("light", { accent: "#f4c95d" });

    expect(cobalt.accentInk).toBe(readableForeground("#5b7cff"));
    expect(contrastRatio(cobalt.accent, cobalt.accentInk)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(amber.accent, amber.accentInk)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the focus token visible when a custom accent matches the canvas", () => {
    const dark = createGlassTheme("dark", { accent: "#0e1113" });
    const light = createGlassTheme("light", { accent: "#fbfaf6" });

    expect(contrastRatio(dark.focus, dark.canvas)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(light.focus, light.canvas)).toBeGreaterThanOrEqual(3);
  });

  it("maps brand colors to stable CSS custom properties", () => {
    const tokens = createGlassThemeTokens(
      createGlassTheme("dark", {
        preset: "teal",
        secondary: "#ff806f",
        tertiary: "#8b7cff",
        radius: "soft",
      }),
    );

    expect(tokens["--ogui-color-secondary"]).toBe("#ff806f");
    expect(tokens["--ogui-color-tertiary"]).toBe("#8b7cff");
    expect(tokens["--ogui-radius-surface"]).toBe("1.65rem");
    expect(
      contrastRatio(tokens["--ogui-color-success"], tokens["--ogui-color-success-ink"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(tokens["--ogui-color-warning"], tokens["--ogui-color-warning-ink"]),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("rejects colors that cannot be evaluated safely", () => {
    expect(() => createGlassTheme("dark", { accent: "green" })).toThrow(
      "Use a three- or six-digit hexadecimal color",
    );
  });
});

const PRESETS = ["neutral", "cobalt", "teal", "violet", "coral", "amber"] as const;
const APPEARANCES = ["dark", "light"] as const;
const CUSTOM_ACCENTS = ["#777777", "#c94735", "#ffd400", "#3355ff", "#00aa55"] as const;

describe("readable foreground", () => {
  it("keeps the soft inks wherever they reach 4.5:1", () => {
    expect(readableForeground("#5b7cff")).toBe("#101214");
    expect(readableForeground("#151719")).toBe("#f9f8f3");
    expect(readableForeground("#3355ff")).toBe("#f9f8f3");
  });

  it("falls back to pure black or white when neither soft ink reaches 4.5:1", () => {
    // Mid grey: #101214 gives 4.16:1 and #f9f8f3 4.21:1.
    expect(readableForeground("#777777")).toBe("#000000");
    expect(contrastRatio("#777777", readableForeground("#777777"))).toBeGreaterThanOrEqual(4.5);
    // The light coral accent: #f9f8f3 gives only 4.45:1.
    expect(readableForeground("#c94735")).toBe("#ffffff");
    expect(contrastRatio("#c94735", readableForeground("#c94735"))).toBeGreaterThanOrEqual(4.5);
  });

  it("judges the ink by its worst contrast over every listed background", () => {
    // #5470ff is #3355ff mixed with 16% white, the top stop of a liquid fill.
    const ink = readableForeground("#3355ff", { over: ["#5470ff"] });
    expect(ink).toBe("#ffffff");
    expect(readableForeground("#3355ff", { over: [] })).toBe("#f9f8f3");
  });
});

describe("accent ink and highlight", () => {
  const themes = [
    ...PRESETS.flatMap((preset) =>
      APPEARANCES.map((appearance) => ({
        name: `${preset}/${appearance}`,
        palette: createGlassTheme(appearance, { preset }),
      })),
    ),
    ...CUSTOM_ACCENTS.flatMap((accent) =>
      APPEARANCES.map((appearance) => ({
        name: `${accent}/${appearance}`,
        palette: createGlassTheme(appearance, { accent }),
      })),
    ),
  ];

  it.each(themes)("reaches 4.5:1 over the whole liquid fill for $name", ({ palette }) => {
    expect(palette.accentHighlight).toMatch(/^#[\da-f]{6}$/);
    expect(contrastRatio(palette.accent, palette.accentInk)).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(palette.accentHighlight as string, palette.accentInk),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps every preset ink the classic design shipped, except where it failed 4.5:1", () => {
    const inks = Object.fromEntries(
      themes
        .slice(0, PRESETS.length * APPEARANCES.length)
        .map(({ name, palette }) => [name, palette.accentInk]),
    );
    expect(inks).toEqual({
      "neutral/dark": "#101214",
      "neutral/light": "#f9f8f3",
      "cobalt/dark": "#101214",
      "cobalt/light": "#f9f8f3",
      "teal/dark": "#101214",
      "teal/light": "#f9f8f3",
      "violet/dark": "#101214",
      "violet/light": "#f9f8f3",
      "coral/dark": "#101214",
      // #f9f8f3 reached only 4.45:1 on #c94735.
      "coral/light": "#ffffff",
      "amber/dark": "#101214",
      "amber/light": "#f9f8f3",
    });
  });

  it("matches CSS color-mix(in srgb, accent, white 16%) when the ink allows it", () => {
    // 0xf4 * 0.84 + 255 * 0.16 = 245.76, and so on per channel.
    expect(createGlassTheme("dark").accentHighlight).toBe("#f6f5f1");
    expect(createGlassTheme("dark", { accent: "#ffd400" }).accentHighlight).toBe("#ffdb29");
    expect(createGlassTheme("dark", { accent: "#777777" }).accentHighlight).toBe("#8d8d8d");
  });

  it("reduces the white share one step at a time until light ink still reads", () => {
    // Light coral keeps 3% white: #c94735 mixed 3% is #cb4d3b, 4% would drop below 4.5:1.
    const coral = createGlassTheme("light", { preset: "coral" });
    expect(coral.accentHighlight).toBe("#cb4d3b");
    expect(contrastRatio("#cb4e3d", coral.accentInk)).toBeLessThan(4.5);
  });

  it("writes the highlight as a theme token", () => {
    const palette = createGlassTheme("light", { preset: "teal" });
    expect(createGlassThemeTokens(palette)["--ogui-color-accent-highlight"]).toBe(
      palette.accentHighlight,
    );
  });

  it("derives the highlight for hand-built palettes and skips it for non-hex accents", () => {
    const { accentHighlight: _omitted, ...legacy } = createGlassTheme("dark");
    expect(createGlassThemeTokens(legacy)["--ogui-color-accent-highlight"]).toBe("#f6f5f1");
    const tokens = createGlassThemeTokens({ ...legacy, accent: "rgb(10 20 30)" });
    expect("--ogui-color-accent-highlight" in tokens).toBe(false);
  });

  it("keeps status inks readable in both appearances", () => {
    for (const appearance of APPEARANCES) {
      const palette = createGlassTheme(appearance);
      expect(contrastRatio(palette.danger, palette.dangerInk)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(palette.success, palette.successInk)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(palette.warning, palette.warningInk)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("capsule radius", () => {
  it("is a pill for balanced and soft, and follows the control radius for sharp", () => {
    expect(createGlassTheme("dark").radiusCapsule).toBe("999px");
    expect(createGlassTheme("dark", { radius: "soft" }).radiusCapsule).toBe("999px");
    expect(createGlassTheme("dark", { radius: "sharp" }).radiusCapsule).toBe("0.5rem");
  });

  it("falls back to a pill for hand-built palettes without the new field", () => {
    const { radiusCapsule: _omitted, ...legacyPalette } = createGlassTheme("light");
    expect(createGlassThemeTokens(legacyPalette)["--ogui-radius-capsule"]).toBe("999px");
  });
});
