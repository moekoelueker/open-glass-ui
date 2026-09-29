import { describe, expect, it } from "vitest";
import { createGlassLookTokens, GLASS_LOOK_PRESETS, resolveGlassLook } from "./look";

describe("glass look", () => {
  it("emits nothing for the default look, so the stylesheet defaults apply", () => {
    expect(createGlassLookTokens()).toEqual({});
    expect(createGlassLookTokens("liquid")).toEqual({});
  });

  it("only emits the fields that are set, so element looks inherit the rest", () => {
    expect(createGlassLookTokens({ lightAngle: 300, blur: 2 })).toEqual({
      "--ogui-glass-light-angle": "300deg",
      "--ogui-glass-blur": "2",
    });
  });

  it("expands presets", () => {
    const smoked = createGlassLookTokens("smoked");
    // Smoked glass needs light text in dark mode and dark text in light mode.
    expect(smoked["--ogui-glass-tint-dark"]).toBe("rgb(8 10 14)");
    expect(smoked["--ogui-glass-tint-light"]).toBeDefined();
    expect(smoked["--ogui-glass-tint"]).toBeUndefined();
    expect(GLASS_LOOK_PRESETS.smoked.tint).toBeTypeOf("object");
    expect(Number(smoked["--ogui-glass-brightness"])).toBeLessThan(1);
    expect(resolveGlassLook("frosted").blur).toBeGreaterThan(1);
  });

  it("normalizes angles and clamps multipliers", () => {
    const tokens = createGlassLookTokens({
      lightAngle: -30,
      lightSpread: 999,
      blur: 99,
      opacity: -1,
      rim: Number.NaN,
    });
    expect(tokens["--ogui-glass-light-angle"]).toBe("330deg");
    expect(tokens["--ogui-glass-light-spread"]).toBe("170deg");
    expect(createGlassLookTokens({ highlight: 3 })["--ogui-glass-highlight"]).toBe("2");
    expect(tokens["--ogui-glass-blur"]).toBe("4");
    expect(tokens["--ogui-glass-opacity"]).toBe("0");
    expect(tokens["--ogui-glass-rim"]).toBe("1");
  });

  it("turns the highlight off when the spread is zero", () => {
    expect(createGlassLookTokens({ lightSpread: 0 })).toEqual({
      "--ogui-glass-light-spread": "1deg",
      "--ogui-glass-highlight": "0",
    });
    expect(createGlassLookTokens({ highlight: 0 })["--ogui-glass-highlight"]).toBe("0");
  });

  it("rejects a tint that could escape its declaration", () => {
    expect(() => createGlassLookTokens({ tint: "red; background: url(x)" })).toThrow(
      /Invalid glass tint/,
    );
    expect(createGlassLookTokens({ tint: " #0b0d10 " })["--ogui-glass-tint"]).toBe("#0b0d10");
    expect(() => createGlassLookTokens({ tint: { light: "x}" } })).toThrow(/Invalid glass tint/);
  });
});
