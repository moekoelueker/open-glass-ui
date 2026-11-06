// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type GlassMaterial, getMaterialPreset } from "@open-glass-ui/core";
import { createCssMaterialTokens } from "@open-glass-ui/renderers";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Glass } from "./glass";
import { GlassThemeProvider } from "./theme";

afterEach(cleanup);

describe("Glass optics overrides", () => {
  it("falls back to the preset for explicitly-undefined optics fields", () => {
    // exactOptionalPropertyTypes rejects this literal, but plain JavaScript
    // consumers and looser tsconfigs produce it all the time.
    const optics = { thickness: undefined, frost: undefined } as unknown as Partial<GlassMaterial>;
    const { container } = render(
      <Glass material="regular" optics={optics}>
        content
      </Glass>,
    );

    const surface = container.querySelector("[data-ogui-glass]");
    expect(surface?.getAttribute("data-ogui-thickness")).toBe(
      getMaterialPreset("regular").thickness.toFixed(3),
    );
    expect(surface?.getAttribute("data-ogui-ior")).toBe(
      getMaterialPreset("regular").ior.toFixed(3),
    );
  });

  it("still applies defined optics overrides", () => {
    const { container } = render(
      <Glass material="regular" optics={{ thickness: 0.91 }}>
        content
      </Glass>,
    );

    const surface = container.querySelector("[data-ogui-glass]");
    expect(surface?.getAttribute("data-ogui-thickness")).toBe("0.910");
  });
});

describe("Glass material declarations", () => {
  // A variable keeps Vite from rewriting `new URL(literal, import.meta.url)`
  // into a served asset URL.
  const stylesheetPath = "../../recipes/src/styles.css";
  const stylesheet = readFileSync(fileURLToPath(new URL(stylesheetPath, import.meta.url)), "utf8");

  it("keeps the material in tokens instead of expanded inline declarations", () => {
    render(
      <GlassThemeProvider appearance="light" design="classic">
        <Glass data-testid="surface" material="frosted" />
      </GlassThemeProvider>,
    );
    const surface = screen.getByTestId("surface");
    const expected = createCssMaterialTokens({
      material: "frosted",
      tone: "light",
      backdropFilter: false,
      reducedTransparency: false,
      forcedColors: false,
    });

    for (const [name, value] of Object.entries(expected)) {
      expect(surface.style.getPropertyValue(name)).toBe(value);
    }
    expect(surface.style.background).toBe("");
    expect(surface.style.borderColor).toBe("");
    expect(surface.style.boxShadow).toBe("");
    expect(surface.style.color).toBe("");
    expect(surface.style.getPropertyValue("backdrop-filter")).toBe("");
    expect(surface.style.getPropertyValue("-webkit-backdrop-filter")).toBe("");
  });

  it("still lets the style prop win over the material", () => {
    render(<Glass data-testid="surface" style={{ background: "red", color: "blue" }} />);
    const surface = screen.getByTestId("surface");
    expect(surface.style.background).toBe("red");
    expect(surface.style.color).toBe("blue");
  });

  it("is painted by a zero-specificity rule at the very top of the recipe stylesheet", () => {
    const rule =
      ":where([data-ogui-glass]) {\n" +
      "  background: var(--ogui-material-background);\n" +
      "  border-color: var(--ogui-material-border);\n" +
      "  box-shadow: var(--ogui-material-shadow);\n" +
      "  color: var(--ogui-material-text);\n" +
      "  -webkit-backdrop-filter: var(--ogui-material-filter);\n" +
      "  backdrop-filter: var(--ogui-material-filter);\n" +
      "}";
    const firstRule = stylesheet.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "");
    expect(firstRule.startsWith(rule)).toBe(true);

    render(<Glass data-testid="surface" />);
    expect(screen.getByTestId("surface").matches(":where([data-ogui-glass])")).toBe(true);
  });

  it("keeps the material border on recipes that reset their border color", () => {
    const selector = ":is(.ogui-toolbar, .ogui-dock, .ogui-disclosure__surface)[data-ogui-glass]";
    expect(stylesheet).toContain(`${selector} {\n  border-color: var(--ogui-material-border);\n}`);
    // It must come before the recipe rules, which another rule set may edit.
    expect(stylesheet.indexOf(selector)).toBeLessThan(
      stylesheet.indexOf(".ogui-toolbar,\n.ogui-dock {"),
    );

    render(
      <>
        <Glass data-testid="toolbar" className="ogui-toolbar" />
        <Glass data-testid="plain" className="custom" />
      </>,
    );
    expect(screen.getByTestId("toolbar").matches(selector)).toBe(true);
    expect(screen.getByTestId("plain").matches(selector)).toBe(false);
  });
});
