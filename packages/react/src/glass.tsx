import {
  type GlassMaterial,
  getMaterialPreset,
  type LensGeometry,
  type MaterialPresetName,
} from "@prism-lab/core";
import {
  createCssMaterialStyle,
  createCssMaterialTokens,
  type MaterialTone,
  type RendererPreference,
  type RendererSource,
  selectRenderer,
} from "@prism-lab/renderers";
import {
  type CSSProperties,
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useGlassPointerField } from "./interaction";
import { useGlassRuntime } from "./provider";

type GlassElement = "aside" | "div" | "nav" | "section" | "span";

export interface GlassProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  as?: GlassElement;
  children?: ReactNode;
  material?: MaterialPresetName;
  tone?: MaterialTone;
  renderer?: RendererPreference;
  source?: RendererSource;
  interactive?: boolean;
  optics?: Partial<GlassMaterial>;
  geometry?: LensGeometry;
  filterId?: string;
}

export const Glass = forwardRef<HTMLElement, GlassProps>(function Glass(
  {
    as = "div",
    children,
    className,
    material = "regular",
    tone = "dark",
    renderer,
    source = "dom",
    interactive = false,
    optics,
    geometry,
    filterId,
    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    style,
    ...rest
  },
  ref,
) {
  const runtime = useGlassRuntime();
  const pointerField = useGlassPointerField(interactive && runtime.motion === "on");
  const resolvedMaterial = { ...getMaterialPreset(material), ...optics };
  const decision = selectRenderer({
    source,
    preference: renderer ?? runtime.renderer,
    capabilities: runtime.capabilities,
  });
  const tokens = createCssMaterialTokens({
    material,
    tone,
    backdropFilter: runtime.capabilities.backdropFilter,
    reducedTransparency: runtime.capabilities.reducedTransparency,
    forcedColors: runtime.capabilities.forcedColors,
  });
  const materialStyle = createCssMaterialStyle(tokens);
  const mergedStyle = {
    ...tokens,
    ...materialStyle,
    "--prism-pointer-x": "0",
    "--prism-pointer-y": "0",
    "--prism-pointer-distance": "0",
    "--prism-press": "0",
    ...(filterId ? { filter: `url(#${filterId})` } : {}),
    ...style,
  } as CSSProperties;

  return createElement(
    as,
    {
      ...rest,
      ref,
      className,
      style: mergedStyle,
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
        pointerField.onPointerMove(event);
        onPointerMove?.(event);
      },
      onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
        pointerField.onPointerLeave(event);
        onPointerLeave?.(event);
      },
      onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
        pointerField.onPointerDown(event);
        onPointerDown?.(event);
      },
      onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
        pointerField.onPointerUp(event);
        onPointerUp?.(event);
      },
      onPointerCancel: (event: React.PointerEvent<HTMLElement>) => {
        pointerField.onPointerCancel(event);
        onPointerCancel?.(event);
      },
      "data-prism-glass": "",
      "data-prism-material": material,
      "data-prism-renderer": decision.renderer,
      "data-prism-renderer-reason": decision.reason,
      "data-prism-interactive": interactive ? "true" : "false",
      "data-prism-hydrated": runtime.hydrated ? "true" : "false",
      "data-prism-motion": runtime.motion,
      "data-prism-quality": runtime.quality,
      "data-prism-shape": geometry?.kind ?? "rounded-rect",
      "data-prism-thickness": resolvedMaterial.thickness.toFixed(3),
      "data-prism-ior": resolvedMaterial.ior.toFixed(3),
    },
    children,
  );
});
