import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Glass, GlassProvider } from "./index";

describe("Glass SSR contract", () => {
  it("renders conservative CSS material markup without browser globals", () => {
    const html = renderToString(
      <GlassProvider>
        <Glass material="clear" optics={{ thickness: 0.9 }}>
          Play
        </Glass>
      </GlassProvider>,
    );

    expect(html).toContain('data-ogui-renderer="css"');
    expect(html).toContain('data-ogui-hydrated="false"');
    expect(html).toContain('data-ogui-quality="low"');
    expect(html).toContain('data-ogui-thickness="0.900"');
    expect(html).toContain("Play");
  });

  it("supports semantic element composition without changing the material contract", () => {
    const html = renderToString(
      <Glass as="nav" aria-label="Primary" material="regular">
        Navigation
      </Glass>,
    );

    expect(html.startsWith("<nav")).toBe(true);
    expect(html).toContain('aria-label="Primary"');
    expect(html).toContain('data-ogui-material="regular"');
  });
});
