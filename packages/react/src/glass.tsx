import {
  createGlassLookTokens,
  type GlassLookInput,
  type GlassMaterial,
  getMaterialPreset,
  type LensGeometry,
  type MaterialPresetName,
} from "@open-glass-ui/core";
import {
  createCssMaterialStyle,
  createCssMaterialTokens,
  type MaterialTone,
  type RendererPreference,
  type RendererSource,
  selectRenderer,
} from "@open-glass-ui/renderers";
import {
  type CSSProperties,
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useGlassPointerField } from "./interaction";
import { useGlassRuntime } from "./provider";
import { useGlassTheme } from "./theme";

type GlassElement = "aside" | "div" | "nav" | "section" | "span";

export interface GlassProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  as?: GlassElement;
  children?: ReactNode;
  material?: MaterialPresetName;
  tone?: MaterialTone | "auto";
  renderer?: RendererPreference;
  source?: RendererSource;
  interactive?: boolean;
  optics?: Partial<GlassMaterial>;
  geometry?: LensGeometry;
  filterId?: string;
  /**
   * Per-element art direction for the liquid design: a preset name or
   * individual multipliers such as `{ lightAngle: 300, blur: 2 }`. Unset fields
   * inherit from the theme's `glass` look.
   */
  look?: GlassLookInput;
}

export const Glass = forwardRef<HTMLElement, GlassProps>(function Glass(
  {
    as = "div",
    children,
    className,
    material = "regular",
    tone = "auto",
    renderer,
    source = "dom",
    interactive = false,
    optics,
    geometry,
    filterId,
    look,
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
  const theme = useGlassTheme();
  const resolvedTone = tone === "auto" ? theme.appearance : tone;
  const pointerField = useGlassPointerField(interactive && runtime.motion === "on");
  // An explicitly-undefined optics field must fall back to the preset value
  // instead of clobbering it, so conditional overrides like
  // `optics={{ thickness: focused ? 0.9 : undefined }}` stay safe.
  const opticsOverrides = Object.fromEntries(
    Object.entries(optics ?? {}).filter(([, value]) => value !== undefined),
  ) as Partial<GlassMaterial>;
  const resolvedMaterial = { ...getMaterialPreset(material), ...opticsOverrides };
  const rendererPreference = renderer ?? (filterId ? "sdf-svg" : runtime.renderer);
  const decision = selectRenderer({
    source,
    preference: rendererPreference,
    capabilities: runtime.capabilities,
  });
  const tokens = createCssMaterialTokens({
    material,
    tone: resolvedTone,
    backdropFilter: runtime.capabilities.backdropFilter,
    reducedTransparency: runtime.capabilities.reducedTransparency,
    forcedColors: runtime.capabilities.forcedColors,
    design: theme.design,
    // Only forward an explicitly supplied frost. Passing the preset's own value
    // unconditionally would round-trip through the interpolation for every
    // surface, and a caller that never set `optics` should get the preset's
    // tokens verbatim.
    ...(optics?.frost === undefined ? {} : { frost: optics.frost }),
  });
  const materialStyle = createCssMaterialStyle(tokens);
  // In liquid the stylesheet draws one ring exactly on the outer edge. A
  // painted border would sit beside it as a second, offset contour, so the
  // border is collapsed. Forced colors keeps it: there the system draws edges.
  // Pass `style={{ borderWidth }}` to keep a border anyway.
  const edge =
    theme.design === "liquid" && !runtime.capabilities.forcedColors ? { borderWidth: 0 } : {};
  const mergedStyle = {
    ...tokens,
    ...materialStyle,
    ...edge,
    "--ogui-pointer-x": "0",
    "--ogui-pointer-y": "0",
    "--ogui-pointer-distance": "0",
    "--ogui-press": "0",
    ...(look === undefined ? {} : createGlassLookTokens(look)),
    ...(filterId && decision.renderer !== "css" ? { filter: `url(#${filterId})` } : {}),
    ...style,
  } as unknown as CSSProperties;

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
      "data-ogui-glass": "",
      "data-ogui-design": theme.design,
      "data-ogui-material": material,
      "data-ogui-tone": resolvedTone,
      "data-ogui-renderer": decision.renderer,
      "data-ogui-renderer-reason": decision.reason,
      "data-ogui-interactive": interactive ? "true" : "false",
      "data-ogui-hydrated": runtime.hydrated ? "true" : "false",
      "data-ogui-motion": runtime.motion,
      "data-ogui-quality": runtime.quality,
      "data-ogui-shape": geometry?.kind ?? "rounded-rect",
      "data-ogui-thickness": resolvedMaterial.thickness.toFixed(3),
      "data-ogui-ior": resolvedMaterial.ior.toFixed(3),
    },
    children,
  );
});
