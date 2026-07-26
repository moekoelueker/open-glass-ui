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
