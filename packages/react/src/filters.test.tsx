import { getMaterialPreset } from "@open-glass-ui/core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OrganicFilterDefinition, SdfFilterDefinition, type SdfFilterState } from "./index";

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
