// @vitest-environment jsdom

import { type GlassMaterial, getMaterialPreset } from "@open-glass-ui/core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Glass } from "./glass";

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
