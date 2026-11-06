// @vitest-environment jsdom

import { createGlassTheme, createGlassThemeTokens } from "@open-glass-ui/core";
import { cleanup, render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Glass } from "./glass";
import { GlassThemeProvider, resolveToneTheme, useGlassTheme } from "./theme";

afterEach(cleanup);

const DARK_TEXT = createGlassTheme("dark").text;
const LIGHT_TEXT = createGlassTheme("light").text;

/** Reads a custom property the way inheritance would, from inline styles up the tree. */
function inherited(element: Element | null, name: string): string {
  for (let node = element; node; node = node.parentElement) {
    const value = (node as HTMLElement).style?.getPropertyValue(name);
    if (value) {
      return value;
    }
  }
  return "";
}

function ThemeProbe({ id }: { id: string }) {
  const theme = useGlassTheme();
  return (
    <output data-testid={id}>
      {[
        theme.appearance,
        theme.palette.text,
        theme.tokens["--ogui-color-text"],
        theme.tokens["--ogui-radius-control"],
        theme.design,
      ].join("|")}
    </output>
  );
}

describe("tone-local theme", () => {
  it("gives a dark surface in a light theme its own light ink", () => {
    render(
      <GlassThemeProvider appearance="light">
        <Glass data-testid="surface" tone="dark">
          <span data-testid="label" style={{ color: "var(--ogui-color-text)" }}>
            Label
          </span>
          <ThemeProbe id="probe" />
        </Glass>
      </GlassThemeProvider>,
    );

    const surface = screen.getByTestId("surface");
    expect(surface.getAttribute("data-ogui-tone")).toBe("dark");
    expect(surface.getAttribute("data-ogui-appearance")).toBe("dark");
    expect(surface.style.colorScheme).toBe("dark");
    expect(surface.style.getPropertyValue("--ogui-color-text")).toBe(DARK_TEXT);
    // The material text resolves through --ogui-color-text on the same element.
    expect(surface.style.getPropertyValue("--ogui-material-text")).toContain(
      "var(--ogui-color-text",
    );
    expect(inherited(screen.getByTestId("label"), "--ogui-color-text")).toBe(DARK_TEXT);
    // Descendants read the scoped theme; radius and design carry over.
    expect(screen.getByTestId("probe").textContent).toBe(
      `dark|${DARK_TEXT}|${DARK_TEXT}|1.05rem|liquid`,
    );
  });

  it("builds the opposite appearance from the same theme input", () => {
    const theme = { accent: "#3355ff", contrast: "standard", radius: "sharp" } as const;
    render(
      <GlassThemeProvider appearance="light" theme={theme}>
        <Glass data-testid="surface" tone="dark" />
      </GlassThemeProvider>,
    );

    const surface = screen.getByTestId("surface");
    const expected = createGlassThemeTokens(createGlassTheme("dark", theme));
    for (const name of [
      "--ogui-color-text",
      "--ogui-color-muted",
      "--ogui-color-border",
      "--ogui-color-control",
      "--ogui-color-surface",
      "--ogui-color-focus",
      "--ogui-color-accent",
      "--ogui-color-accent-ink",
      "--ogui-color-accent-highlight",
    ] as const) {
      expect(surface.style.getPropertyValue(name)).toBe(expected[name]);
    }
    expect(surface.style.getPropertyValue("--ogui-color-muted")).toBe("#a5aaa6");
    // Radius does not depend on appearance and is inherited, not rewritten.
    expect(surface.style.getPropertyValue("--ogui-radius-control")).toBe("");
  });

  it("resolves a nested opposite tone against the nearest surface", () => {
    render(
      <GlassThemeProvider appearance="light">
        <Glass data-testid="outer" tone="dark">
          <Glass data-testid="inner" tone="light">
            <span data-testid="label">Label</span>
            <ThemeProbe id="probe" />
          </Glass>
          <Glass data-testid="same" tone="dark" />
          <Glass data-testid="auto" />
        </Glass>
      </GlassThemeProvider>,
    );

    const inner = screen.getByTestId("inner");
    expect(inner.getAttribute("data-ogui-appearance")).toBe("light");
    expect(inner.style.colorScheme).toBe("light");
    expect(inner.style.getPropertyValue("--ogui-color-text")).toBe(LIGHT_TEXT);
    expect(inherited(screen.getByTestId("label"), "--ogui-color-text")).toBe(LIGHT_TEXT);
    expect(screen.getByTestId("probe").textContent?.startsWith(`light|${LIGHT_TEXT}`)).toBe(true);

    // Inside the dark surface, dark is the matching tone and auto resolves to it.
    for (const id of ["same", "auto"]) {
      const surface = screen.getByTestId(id);
      expect(surface.getAttribute("data-ogui-tone")).toBe("dark");
      expect(surface.hasAttribute("data-ogui-appearance")).toBe(false);
      expect(surface.style.getPropertyValue("--ogui-color-text")).toBe("");
      expect(inherited(surface, "--ogui-color-text")).toBe(DARK_TEXT);
    }
  });

  it("leaves matching and auto tones exactly as they were", () => {
    const markup = (tone: "auto" | "light") =>
      renderToString(
        <GlassThemeProvider appearance="light">
          <Glass tone={tone} material="clear">
            <ThemeProbe id="probe" />
          </Glass>
        </GlassThemeProvider>,
      );

    const auto = markup("auto");
    expect(markup("light")).toBe(auto);
    const glass = auto.slice(auto.indexOf("<div", 1));
    const glassTag = glass.slice(0, glass.indexOf(">"));
    // Material tokens reference var(--ogui-color-*); none is declared here.
    expect(glassTag).not.toMatch(/--ogui-color-[\w-]+:/);
    expect(glassTag).not.toContain("color-scheme");
    expect(glassTag).not.toContain("data-ogui-appearance");
  });

  it("lets the caller's style and attributes win", () => {
    render(
      <GlassThemeProvider appearance="light">
        <Glass
          data-testid="surface"
          data-ogui-appearance="light"
          tone="dark"
          style={{ "--ogui-color-text": "#ff0000", colorScheme: "light" } as CSSProperties}
        />
      </GlassThemeProvider>,
    );

    const surface = screen.getByTestId("surface");
    expect(surface.style.getPropertyValue("--ogui-color-text")).toBe("#ff0000");
    expect(surface.style.colorScheme).toBe("light");
    expect(surface.getAttribute("data-ogui-appearance")).toBe("light");
    expect(surface.style.getPropertyValue("--ogui-color-muted")).toBe(
      createGlassTheme("dark").muted,
    );
  });

  it("scopes a tone without any provider against the dark default", () => {
    render(<Glass data-testid="surface" tone="light" />);
    const surface = screen.getByTestId("surface");
    expect(surface.getAttribute("data-ogui-appearance")).toBe("light");
    expect(surface.style.getPropertyValue("--ogui-color-text")).toBe(LIGHT_TEXT);
  });

  it("renders the same scoped markup on every server pass", () => {
    const tree = (
      <GlassThemeProvider appearance="light" theme={{ preset: "coral" }}>
        <Glass tone="dark">
          <Glass tone="light">Content</Glass>
        </Glass>
      </GlassThemeProvider>
    );
    const first = renderToString(tree);
    expect(renderToString(tree)).toBe(first);
    expect(first).toContain('data-ogui-appearance="dark"');
    expect(first).toContain(`--ogui-color-text:${DARK_TEXT}`);
    expect(first).toContain("color-scheme:dark");
    expect(first).toContain(`--ogui-color-text:${LIGHT_TEXT}`);
  });
});

describe("resolveToneTheme", () => {
  function Capture({ onTheme }: { onTheme: (theme: ReturnType<typeof useGlassTheme>) => void }) {
    onTheme(useGlassTheme());
    return null;
  }

  it("returns the same runtime for a matching or auto tone", () => {
    let captured: ReturnType<typeof useGlassTheme> | null = null;
    render(
      <GlassThemeProvider appearance="dark" theme={{ glass: "frosted" }}>
        <Capture
          onTheme={(theme) => {
            captured = theme;
          }}
        />
      </GlassThemeProvider>,
    );
    const theme = captured as unknown as ReturnType<typeof useGlassTheme>;

    expect(resolveToneTheme(theme, "dark")).toBe(theme);
    expect(resolveToneTheme(theme, "auto")).toBe(theme);
    expect(resolveToneTheme(theme, undefined)).toBe(theme);

    const light = resolveToneTheme(theme, "light");
    expect(resolveToneTheme(theme, "light")).toBe(light);
    expect(light.appearance).toBe("light");
    expect(light.design).toBe(theme.design);
    expect(light.input).toBe(theme.input);
    expect(light.palette).toEqual(createGlassTheme("light", theme.input));
    expect(light.tokens["--ogui-color-text"]).toBe(LIGHT_TEXT);
    expect(light.tokens["--ogui-glass-blur"]).toBe(theme.tokens["--ogui-glass-blur"]);
    expect(light.tokens["--ogui-radius-surface"]).toBe(theme.tokens["--ogui-radius-surface"]);
  });
});
