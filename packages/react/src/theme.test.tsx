// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlassThemeProvider, useGlassTheme } from "./theme";

function Probe() {
  const theme = useGlassTheme();
  return (
    <output data-testid="theme">
      {theme.appearance}:{theme.palette.accent}:{theme.palette.accentInk}
    </output>
  );
}

function TokenProbe() {
  return <output data-testid="focus-token">{useGlassTheme().tokens["--ogui-color-focus"]}</output>;
}

afterEach(cleanup);

describe("GlassThemeProvider", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("light"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("renders deterministic neutral server tokens", () => {
    const html = renderToString(
      <GlassThemeProvider appearance="dark">
        <Probe />
      </GlassThemeProvider>,
    );

    expect(html).toContain('data-ogui-appearance="dark"');
    expect(html).toContain("--ogui-color-accent:#f4f3ee");
  });

  it("resolves system appearance after hydration", async () => {
    render(
      <GlassThemeProvider appearance="system">
        <Probe />
      </GlassThemeProvider>,
    );

    await act(async () => {});
    expect(screen.getByTestId("theme").textContent).toContain("light:#151719");
  });

  it("scopes custom colors and derives readable accent ink", () => {
    render(
      <GlassThemeProvider
        appearance="dark"
        theme={{ accent: "#5b7cff", secondary: "#ff806f", tertiary: "#5eead4" }}
      >
        <Probe />
      </GlassThemeProvider>,
    );

    const scope = screen.getByTestId("theme").parentElement;
    expect(scope?.style.getPropertyValue("--ogui-color-secondary")).toBe("#ff806f");
    expect(scope?.style.getPropertyValue("--ogui-color-accent-ink")).not.toBe("");
  });

  it("exposes direct token overrides to portal consumers", () => {
    render(
      <GlassThemeProvider
        appearance="dark"
        style={{ "--ogui-color-focus": "#ff00aa" } as CSSProperties}
      >
        <TokenProbe />
      </GlassThemeProvider>,
    );

    expect(screen.getByTestId("focus-token").textContent).toBe("#ff00aa");
  });
});
