import {
  applyQualityToMapInput,
  type GlassMaterial,
  generateDisplacementMap,
  getMaterialPreset,
  type LensGeometry,
  type OpticsQuality,
} from "@open-glass-ui/core";
import {
  type CanvasFactory,
  createStableFilterId,
  createSvgDisplacementFilterSpec,
  encodeDisplacementMap,
  type SvgDisplacementFilterSpec,
} from "@open-glass-ui/renderers";
import { type ReactNode, useEffect, useMemo, useState } from "react";

export interface SdfFilterOptions {
  id: string;
  width: number;
  height: number;
  geometry: LensGeometry;
  material?: GlassMaterial;
  quality?: OpticsQuality;
  canvasFactory?: CanvasFactory;
}

export interface SdfFilterState {
  filterId: string;
  ready: boolean;
  error: string | null;
  spec: SvgDisplacementFilterSpec | null;
}

export interface SdfFilterDefinitionProps {
  filter: SdfFilterState;
}

export interface OrganicFilterDefinitionProps {
  id: string;
  frequency?: number;
  turbulence?: number;
  scale?: number;
  seed?: number;
  animate?: boolean;
  children?: ReactNode;
}

export function useSdfFilter({
  id,
  width,
  height,
  geometry,
  material = getMaterialPreset("regular"),
  quality = "medium",
  canvasFactory,
}: SdfFilterOptions): SdfFilterState {
  const { kind, width: geometryWidth, height: geometryHeight, cornerRadius, exponent } = geometry;
  const { thickness, ior, dispersion, edgeStrength, bevel, frost } = material;
  const map = useMemo(() => {
    const stableGeometry: LensGeometry = {
      kind,
      width: geometryWidth,
      height: geometryHeight,
      ...(cornerRadius === undefined ? {} : { cornerRadius }),
      ...(exponent === undefined ? {} : { exponent }),
    };
    const stableMaterial: GlassMaterial = {
      thickness,
      ior,
      dispersion,
      edgeStrength,
      bevel,
      frost,
    };
    const input = applyQualityToMapInput(
      {
        width,
        height,
        geometry: stableGeometry,
        material: stableMaterial,
      },
      quality,
    );

    return generateDisplacementMap(input);
  }, [
    bevel,
    cornerRadius,
    dispersion,
    edgeStrength,
    exponent,
    frost,
    geometryHeight,
    geometryWidth,
    height,
    ior,
    kind,
    quality,
    thickness,
    width,
  ]);
  const filterId = createStableFilterId(id, map.cacheKey);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setMapUrl(encodeDisplacementMap(map, canvasFactory));
      setError(null);
    } catch (encodingError) {
      setMapUrl(null);
      setError(
        encodingError instanceof Error ? encodingError.message : "Unknown map encoding error.",
      );
    }
  }, [canvasFactory, map]);

  return {
    filterId,
    ready: mapUrl !== null,
    error,
    spec: mapUrl
      ? createSvgDisplacementFilterSpec(id, map, mapUrl, {
          thickness,
          ior,
          dispersion,
          edgeStrength,
          bevel,
          frost,
        })
      : null,
  };
}

export function SdfFilterDefinition({ filter }: SdfFilterDefinitionProps) {
  const spec = filter.spec;

  if (!spec) {
    return null;
  }

  const redMatrix = "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0";
  const greenMatrix = "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0";
  const blueMatrix = "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0";
  const specularMatrix = `0 0 1 0 0  0 0 1 0 0  0 0 1 0 0  0 0 ${spec.specularOpacity} 0 0`;

  return (
    <svg
      aria-hidden="true"
      data-ogui-sdf-definition={filter.filterId}
      focusable="false"
      height="0"
      style={{ position: "absolute" }}
      width="0"
    >
      <defs>
        <filter
          id={filter.filterId}
          colorInterpolationFilters="sRGB"
          height={spec.height}
          width={spec.width}
          x={spec.x}
          y={spec.y}
        >
          <feImage
            height="100%"
            href={spec.href}
            preserveAspectRatio="none"
            result="OGUI_MAP"
            width="100%"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="OGUI_MAP"
            result="OGUI_RED_SHIFT"
            scale={spec.redScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix in="OGUI_RED_SHIFT" result="OGUI_RED" type="matrix" values={redMatrix} />
          <feDisplacementMap
            in="SourceGraphic"
            in2="OGUI_MAP"
            result="OGUI_GREEN_SHIFT"
            scale={spec.greenScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            in="OGUI_GREEN_SHIFT"
            result="OGUI_GREEN"
            type="matrix"
            values={greenMatrix}
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="OGUI_MAP"
            result="OGUI_BLUE_SHIFT"
            scale={spec.blueScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feColorMatrix
            in="OGUI_BLUE_SHIFT"
            result="OGUI_BLUE"
            type="matrix"
            values={blueMatrix}
          />
          <feBlend in="OGUI_RED" in2="OGUI_GREEN" mode="screen" result="OGUI_RG" />
          <feBlend in="OGUI_RG" in2="OGUI_BLUE" mode="screen" result="OGUI_RGB" />
          <feColorMatrix
            in="OGUI_MAP"
            result="OGUI_SPECULAR"
            type="matrix"
            values={specularMatrix}
          />
          <feComposite in="OGUI_SPECULAR" in2="SourceGraphic" operator="in" result="OGUI_SPEC" />
          <feBlend in="OGUI_RGB" in2="OGUI_SPEC" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}

export function OrganicFilterDefinition({
  id,
  frequency = 0.012,
  turbulence = 2,
  scale = 18,
  seed = 7,
  animate = true,
  children,
}: OrganicFilterDefinitionProps) {
  const baseFrequency = Math.min(Math.max(frequency, 0.001), 0.08);
  const octaves = Math.round(Math.min(Math.max(turbulence, 1), 4));
  const displacementScale = Math.min(Math.max(scale, 0), 64);

  return (
    <svg
      aria-hidden="true"
      data-ogui-organic-definition={id}
      focusable="false"
      height="0"
      style={{ position: "absolute" }}
      width="0"
    >
      <defs>
        <filter
          id={id}
          colorInterpolationFilters="sRGB"
          height="130%"
          width="130%"
          x="-15%"
          y="-15%"
        >
          <feTurbulence
            baseFrequency={`${baseFrequency} ${baseFrequency * 1.35}`}
            numOctaves={octaves}
            result="OGUI_FLOW"
            seed={Math.round(seed)}
            type="fractalNoise"
          >
            {animate ? (
              <animate
                attributeName="baseFrequency"
                dur="8s"
                repeatCount="indefinite"
                values={`${baseFrequency} ${baseFrequency * 1.35}; ${baseFrequency * 1.24} ${
                  baseFrequency * 0.92
                }; ${baseFrequency} ${baseFrequency * 1.35}`}
              />
            ) : null}
          </feTurbulence>
          <feGaussianBlur in="OGUI_FLOW" result="OGUI_SILK" stdDeviation="0.55" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="OGUI_SILK"
            result="OGUI_ORGANIC"
            scale={displacementScale}
            xChannelSelector="R"
            yChannelSelector="B"
          />
          <feColorMatrix
            in="OGUI_ORGANIC"
            type="matrix"
            values="1.04 0 0 0 0  0 1.04 0 0 0  0 0 1.08 0 0  0 0 0 1 0"
          />
        </filter>
        {children}
      </defs>
    </svg>
  );
}
