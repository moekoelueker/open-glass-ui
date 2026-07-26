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
