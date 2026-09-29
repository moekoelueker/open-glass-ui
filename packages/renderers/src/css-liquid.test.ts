import { describe, expect, it } from "vitest";
import { createCssMaterialTokens, type MaterialTone } from "./index";

const MATERIALS = ["clear", "regular", "frosted"] as const;
const TONES: MaterialTone[] = ["dark", "light"];

describe("liquid CSS material", () => {
  it("keeps the 0.3 classic output when no design is passed", () => {
    for (const material of MATERIALS) {
      for (const tone of TONES) {
        expect(createCssMaterialTokens({ material, tone })).toEqual(
          createCssMaterialTokens({ material, tone, design: "classic" }),
        );
      }
    }
  });

  it("is clearer than classic while staying ordered clear < regular < frosted", () => {
    const blur = (material: (typeof MATERIALS)[number]) =>
      Number(
        /blur\(calc\(([\d.]+)px/.exec(
          createCssMaterialTokens({ material, tone: "dark", design: "liquid" })[
            "--ogui-material-filter"
          ],
        )?.[1],
      );
    const classicRegular = createCssMaterialTokens({ material: "regular", tone: "dark" });

    expect(blur("clear")).toBeLessThan(blur("regular"));
    expect(blur("regular")).toBeLessThan(blur("frosted"));
    expect(blur("regular")).toBeLessThan(22);
    expect(classicRegular["--ogui-material-filter"]).toContain("blur(22px)");
  });

  it("aims the inner bloom at the configurable light angle and hides the border", () => {
    for (const material of MATERIALS) {
      const tokens = createCssMaterialTokens({ material, tone: "light", design: "liquid" });
      expect(tokens["--ogui-material-shadow"]).toContain(
        "sin(var(--ogui-glass-light-angle, 340deg))",
      );
      // The stylesheet's ring is the only painted edge.
      expect(tokens["--ogui-material-border"]).toBe("transparent");
    }
  });

  it("routes every optical value through the public look multipliers", () => {
    const tokens = createCssMaterialTokens({ material: "regular", tone: "dark", design: "liquid" });
    expect(tokens["--ogui-material-filter"]).toContain("var(--ogui-glass-blur, 1)");
    expect(tokens["--ogui-material-filter"]).toContain("var(--ogui-glass-saturation, 1)");
    expect(tokens["--ogui-material-filter"]).toContain("var(--ogui-glass-brightness, 1)");
    expect(tokens["--ogui-material-background"]).toContain("var(--ogui-glass-tint,");
    expect(tokens["--ogui-material-background"]).toContain("var(--ogui-glass-opacity, 1)");
    expect(tokens["--ogui-material-shadow"]).toContain("var(--ogui-glass-shadow, 1)");
    expect(tokens["--ogui-material-shadow"]).toContain("var(--ogui-glass-lensing, 1)");
  });

  it("interpolates frost overrides on liquid anchors", () => {
    const tokens = createCssMaterialTokens({
      material: "regular",
      tone: "dark",
      design: "liquid",
      frost: 0.66,
    });
    expect(tokens["--ogui-material-filter"]).toContain("blur(calc(30.00px *");
    expect(tokens["--ogui-material-background"]).toContain("calc(55.0% *");
  });

  it("dims the backdrop under dark glass and lifts it under light glass", () => {
    const brightness = (tone: MaterialTone) =>
      Number(
        /brightness\(calc\(([\d.]+) \*/.exec(
          createCssMaterialTokens({ material: "clear", tone, design: "liquid" })[
            "--ogui-material-filter"
          ],
        )?.[1],
      );
    expect(brightness("dark")).toBeLessThan(0.7);
    expect(brightness("light")).toBeGreaterThan(1);
  });

  it("uses a per-appearance tint before the shared one", () => {
    const tokens = createCssMaterialTokens({ material: "regular", tone: "dark", design: "liquid" });
    expect(tokens["--ogui-material-background"]).toContain(
      "var(--ogui-glass-tint-dark, var(--ogui-glass-tint,",
    );
  });

  it("still honours reduced transparency and forced colors in liquid", () => {
    expect(
      createCssMaterialTokens({
        material: "clear",
        tone: "dark",
        design: "liquid",
        reducedTransparency: true,
      })["--ogui-material-filter"],
    ).toBe("none");
    expect(
      createCssMaterialTokens({
        material: "clear",
        tone: "dark",
        design: "liquid",
        forcedColors: true,
      })["--ogui-material-background"],
    ).toBe("Canvas");
  });
});
