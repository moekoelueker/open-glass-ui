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

/** Reference CSS `color-mix(in srgb, color, <white|black> percent%)`, rounded to 8 bits. */
function mix(color: string, target: "white" | "black", percent: number) {
  const value = target === "white" ? 255 : 0;
  return `#${[1, 3, 5]
    .map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16))
    .map((channel) => Math.round((channel * (100 - percent) + value * percent) / 100))
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

const DARK_INKS = ["#101214", "#000000"];
const INK_CANDIDATES = ["#101214", "#f9f8f3", "#000000", "#ffffff"];
/** The 6% translucent bottom stop over the worst backdrop for that ink. */
const translucentStop = (accent: string, ink: string) =>
  mix(accent, DARK_INKS.includes(ink) ? "black" : "white", 6);

describe("accent ink and highlight mix", () => {
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
  /**
   * Mid-tone accents for which no ink, at any highlight mix, also reaches
   * 4.5:1 on the 6% translucent stop over a white or black page. For these the
   * translucency check is dropped and only the opaque stops are guaranteed.
   */
  const MID_TONES = new Set(["teal/light", "coral/light", "#777777", "#c94735"]);
  const isMidTone = (name: string) =>
    MID_TONES.has(name) || MID_TONES.has(name.slice(0, name.indexOf("/")));

  it.each(themes)("reaches 4.5:1 on the accent and its highlight for $name", ({ palette }) => {
    const highlightMix = palette.accentHighlightMix as number;
    expect(Number.isInteger(highlightMix)).toBe(true);
    expect(highlightMix).toBeGreaterThanOrEqual(0);
    expect(highlightMix).toBeLessThanOrEqual(16);
    expect(contrastRatio(palette.accent, palette.accentInk)).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(mix(palette.accent, "white", highlightMix), palette.accentInk),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(themes)(
    "covers the translucent stop wherever any ink can for $name",
    ({ name, palette }) => {
      const stop = translucentStop(palette.accent, palette.accentInk);
      if (isMidTone(name)) {
        for (const ink of INK_CANDIDATES) {
          expect(
            Math.min(
              contrastRatio(palette.accent, ink),
              contrastRatio(translucentStop(palette.accent, ink), ink),
            ),
          ).toBeLessThan(4.5);
        }
      } else {
        expect(contrastRatio(stop, palette.accentInk)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it("chooses the ink and the highlight mix together for every preset", () => {
    const choices = Object.fromEntries(
      themes
        .slice(0, PRESETS.length * APPEARANCES.length)
        .map(({ name, palette }) => [name, `${palette.accentInk} ${palette.accentHighlightMix}%`]),
    );
    expect(choices).toEqual({
      "neutral/dark": "#101214 16%",
      "neutral/light": "#f9f8f3 16%",
      "cobalt/dark": "#101214 16%",
      "cobalt/light": "#ffffff 9%",
      "teal/dark": "#101214 16%",
      "teal/light": "#ffffff 5%",
      "violet/dark": "#101214 16%",
      "violet/light": "#ffffff 14%",
      "coral/dark": "#101214 16%",
      "coral/light": "#ffffff 3%",
      "amber/dark": "#101214 16%",
      "amber/light": "#ffffff 6%",
    });
  });

  it("keeps the full 16% highlight whenever an ink allows it", () => {
    // Dark ink only gains contrast as white is mixed in, so nothing changes.
    expect(createGlassTheme("dark").accentHighlightMix).toBe(16);
    expect(createGlassTheme("dark", { accent: "#ffd400" })).toMatchObject({
      accentInk: "#101214",
      accentHighlightMix: 16,
    });
    // Mid grey: neither soft ink reaches 4.5:1, pure black does at 16%.
    expect(createGlassTheme("dark", { accent: "#777777" })).toMatchObject({
      accentInk: "#000000",
      accentHighlightMix: 16,
    });
  });

  it("gives the light coral accent light ink with a reduced highlight, never black", () => {
    // Black reaches only 4.44:1 on #c94735 itself.
    const coral = createGlassTheme("light", { accent: "#c94735" });
    expect(coral.accentInk).toBe("#ffffff");
    expect(coral.accentHighlightMix).toBe(3);
    expect(contrastRatio("#c94735", "#000000")).toBeLessThan(4.5);
    // One more step of white would drop below 4.5:1.
    expect(contrastRatio(mix("#c94735", "white", 4), coral.accentInk)).toBeLessThan(4.5);
  });

  it("prefers the ink that keeps the most highlight when none keeps all of it", () => {
    // #3355ff: #f9f8f3 keeps 7%, #ffffff keeps 10%.
    const blue = createGlassTheme("light", { accent: "#3355ff" });
    expect(blue).toMatchObject({ accentInk: "#ffffff", accentHighlightMix: 10 });
  });

  it("writes the mix amount, not a color, as a theme token", () => {
    const tokens = createGlassThemeTokens(createGlassTheme("light", { preset: "teal" }));
    expect(tokens["--ogui-color-accent-highlight-mix"]).toBe("5%");
    expect(
      createGlassThemeTokens(createGlassTheme("dark"))["--ogui-color-accent-highlight-mix"],
    ).toBe("16%");
    expect(Object.keys(tokens)).not.toContain("--ogui-color-accent-highlight");
  });

  it("derives the mix for hand-built palettes and skips it for non-hex accents", () => {
    const { accentHighlightMix: _omitted, ...legacy } = createGlassTheme("light", {
      preset: "violet",
    });
    expect(createGlassThemeTokens(legacy)["--ogui-color-accent-highlight-mix"]).toBe("14%");
    // A soft ink kept by a hand-built palette gets the mix that ink allows.
    expect(
      createGlassThemeTokens({ ...legacy, accentInk: "#f9f8f3" })[
        "--ogui-color-accent-highlight-mix"
      ],
    ).toBe("11%");
    const tokens = createGlassThemeTokens({ ...legacy, accent: "rgb(10 20 30)" });
    expect("--ogui-color-accent-highlight-mix" in tokens).toBe(false);
    expect(
      createGlassThemeTokens({ ...legacy, accentHighlightMix: 40 })[
        "--ogui-color-accent-highlight-mix"
      ],
    ).toBe("16%");
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
