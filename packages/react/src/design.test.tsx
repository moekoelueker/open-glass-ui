// @vitest-environment jsdom

import { createCssMaterialTokens } from "@open-glass-ui/renderers";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Glass } from "./glass";
import { GlassThemeProvider, useGlassTheme } from "./theme";

afterEach(cleanup);

function DesignProbe() {
  const theme = useGlassTheme();
  return (
    <output data-testid="design">
      {`${theme.design}:${theme.tokens["--ogui-radius-control"]}:${theme.tokens["--ogui-radius-capsule"]}`}
    </output>
  );
}

describe("design switch", () => {
  it("defaults to liquid with the soft radius scale", () => {
    const html = renderToString(
      <GlassThemeProvider appearance="dark">
        <DesignProbe />
      </GlassThemeProvider>,
    );
    expect(html).toContain('data-ogui-design="liquid"');
    expect(html).toContain("liquid:1.05rem:999px");
  });

  it("restores the 0.3 look, including the balanced radius, with design=classic", () => {
    const html = renderToString(
      <GlassThemeProvider appearance="dark" design="classic">
        <DesignProbe />
      </GlassThemeProvider>,
    );
    expect(html).toContain('data-ogui-design="classic"');
    expect(html).toContain("classic:0.8rem:999px");
  });

  it("lets an explicit radius win over the liquid default", () => {
    render(
      <GlassThemeProvider appearance="dark" theme={{ radius: "sharp" }}>
        <DesignProbe />
      </GlassThemeProvider>,
    );
    expect(screen.getByTestId("design").textContent).toBe("liquid:0.5rem:0.5rem");
  });

  it("renders classic Glass tokens byte-for-byte as 0.3 did", () => {
    render(
      <GlassThemeProvider appearance="dark" design="classic">
        <Glass data-testid="glass" material="frosted" />
      </GlassThemeProvider>,
    );
    const glass = screen.getByTestId("glass");
    // Server capabilities report no backdrop-filter before hydration, so compare
    // against the same capability snapshot the runtime used.
    const expected = createCssMaterialTokens({
      material: "frosted",
      tone: "dark",
      backdropFilter: false,
      reducedTransparency: false,
      forcedColors: false,
    });
    expect(glass.getAttribute("data-ogui-design")).toBe("classic");
    expect(glass.style.getPropertyValue("--ogui-material-background")).toBe(
      expected["--ogui-material-background"],
    );
  });

  it("marks each Glass with the nearest design, so nested scopes resolve", () => {
    render(
      <GlassThemeProvider appearance="dark">
        <Glass data-testid="outer">
          <GlassThemeProvider appearance="dark" design="classic">
            <Glass data-testid="inner" />
          </GlassThemeProvider>
        </Glass>
      </GlassThemeProvider>,
    );
    expect(screen.getByTestId("outer").getAttribute("data-ogui-design")).toBe("liquid");
    expect(screen.getByTestId("inner").getAttribute("data-ogui-design")).toBe("classic");
  });
});

describe("glass look", () => {
  it("writes the theme look on the boundary and carries it in runtime tokens", () => {
    function LookProbe() {
      return <output data-testid="look">{useGlassTheme().tokens["--ogui-glass-blur"]}</output>;
    }
    const { container } = render(
      <GlassThemeProvider appearance="dark" theme={{ glass: "frosted" }}>
        <LookProbe />
      </GlassThemeProvider>,
    );
    const root = container.querySelector("[data-ogui-theme]") as HTMLElement;
    expect(root.style.getPropertyValue("--ogui-glass-blur")).toBe("2.2");
    expect(screen.getByTestId("look").textContent).toBe("2.2");
  });

  it("lets one Glass override the light direction", () => {
    render(
      <GlassThemeProvider appearance="dark">
        <Glass data-testid="lit" look={{ lightAngle: 270 }} />
      </GlassThemeProvider>,
    );
    expect(screen.getByTestId("lit").style.getPropertyValue("--ogui-glass-light-angle")).toBe(
      "270deg",
    );
  });

  it("collapses the painted border in liquid so the ring is the only edge", () => {
    render(
      <GlassThemeProvider appearance="dark">
        <Glass data-testid="liquid" />
        <Glass data-testid="kept" style={{ borderWidth: 2 }} />
      </GlassThemeProvider>,
    );
    expect(screen.getByTestId("liquid").style.borderWidth).toBe("0px");
    expect(screen.getByTestId("kept").style.borderWidth).toBe("2px");
  });

  it("leaves the border alone in classic", () => {
    render(
      <GlassThemeProvider appearance="dark" design="classic">
        <Glass data-testid="classic" />
      </GlassThemeProvider>,
    );
    expect(screen.getByTestId("classic").style.borderWidth).toBe("");
  });
});
