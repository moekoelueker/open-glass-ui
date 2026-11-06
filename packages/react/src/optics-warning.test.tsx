// @vitest-environment jsdom

// Its own file: the warning is shown once per module instance, and Vitest
// gives every test file a fresh one.
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GLASS_OPTICS_WARNING, Glass } from "./glass";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Glass optics development warning", () => {
  it("stays quiet for frost, which the material does render", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Glass optics={{ frost: 0.5 }} />);
    render(<Glass optics={{ frost: 0.5, thickness: undefined }} />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("stays quiet in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Glass optics={{ thickness: 0.9 }} />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns once when refraction fields are passed", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <>
        <Glass optics={{ thickness: 0.9 }} />
        <Glass optics={{ ior: 1.6, frost: 0.2 }} renderer="sdf-svg" />
      </>,
    );
    render(<Glass optics={{ dispersion: 0.4 }} />);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(GLASS_OPTICS_WARNING);
    expect(GLASS_OPTICS_WARNING).toContain("only changes `frost`");
    expect(GLASS_OPTICS_WARNING).toContain("useSdfFilter({ material })");
    expect(GLASS_OPTICS_WARNING).toContain("WebGLLens.material");
  });
});
