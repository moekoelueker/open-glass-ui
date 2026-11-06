import { getMaterialPreset, type OpticsQuality } from "@open-glass-ui/core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  GlassProvider,
  type GlassQualityPreference,
  OrganicFilterDefinition,
  SdfFilterDefinition,
  type SdfFilterState,
  useSdfFilter,
} from "./index";

describe("useSdfFilter quality", () => {
  function FilterId({ quality }: { quality?: OpticsQuality }) {
    const filter = useSdfFilter({
      id: "lens",
      width: 160,
      height: 64,
      geometry: { kind: "rounded-rect", width: 160, height: 64, cornerRadius: 24 },
      ...(quality === undefined ? {} : { quality }),
    });
    return <output>{filter.filterId}</output>;
  }

  const filterId = (provider: GlassQualityPreference | null, quality?: OpticsQuality) => {
    const probe = quality === undefined ? <FilterId /> : <FilterId quality={quality} />;
    const html = renderToString(
      provider === null ? probe : <GlassProvider quality={provider}>{probe}</GlassProvider>,
    );
    return html.replace(/<\/?output>/g, "");
  };

  it("follows the provider's runtime quality by default", () => {
    expect(filterId("high")).toBe(filterId(null, "high"));
    expect(filterId("low")).toBe(filterId(null, "low"));
    expect(filterId("high")).not.toBe(filterId("low"));
  });

  it("lets an explicit quality win over the provider", () => {
    expect(filterId("high", "low")).toBe(filterId(null, "low"));
    expect(filterId("low", "high")).toBe(filterId(null, "high"));
  });

  it("uses the conservative runtime quality before hydration", () => {
    // "auto" resolves against server capabilities, which report a single core,
    // and no provider at all means the same conservative default.
    expect(filterId("auto")).toBe(filterId(null, "low"));
    expect(filterId(null)).toBe(filterId(null, "low"));
  });
});

describe("React SVG filter definitions", () => {
  it("renders an animated or static organic displacement engine", () => {
    const animated = renderToString(
      <OrganicFilterDefinition id="flow" animate frequency={0.02} scale={24} />,
    );
    const staticMarkup = renderToString(<OrganicFilterDefinition id="still" animate={false} />);

    expect(animated).toContain("<feTurbulence");
    expect(animated).toContain("<feDisplacementMap");
    expect(animated).toContain("<animate");
    expect(staticMarkup).not.toContain("<animate");
  });

  it("renders channel-separated SDF displacement and specular composition", () => {
    const material = getMaterialPreset("clear");
    const filter: SdfFilterState = {
      filterId: "sdf-test",
      ready: true,
      error: null,
      spec: {
        id: "sdf-test",
        href: "data:image/png;base64,test",
        x: "-18%",
        y: "-18%",
        width: "136%",
        height: "136%",
        redScale: 12,
        greenScale: 10,
        blueScale: 8,
        specularOpacity: material.edgeStrength,
      },
    };
    const html = renderToString(<SdfFilterDefinition filter={filter} />);

    expect(html.match(/<feDisplacementMap/g)).toHaveLength(3);
    expect(html).toContain("OGUI_SPECULAR");
    expect(html).toContain("data:image/png;base64,test");
  });

  it("renders no incomplete filter resource before map encoding", () => {
    const filter: SdfFilterState = {
      filterId: "pending",
      ready: false,
      error: null,
      spec: null,
    };

    expect(renderToString(<SdfFilterDefinition filter={filter} />)).toBe("");
  });
});
