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
  useEffect,
} from "react";
import { useGlassPointerField } from "./interaction";
import { useGlassRuntime } from "./provider";
import { GlassThemeContext, resolveToneScope, useGlassTheme } from "./theme";

type GlassElement = "aside" | "div" | "nav" | "section" | "span";

export const GLASS_OPTICS_WARNING =
  "OpenGlass UI: <Glass optics> only changes `frost` on the rendered material, on every " +
  "renderer path. The refraction fields (thickness, ior, dispersion, edgeStrength, bevel) are " +
  "only reported as data attributes. To refract, pass the same material to " +
  "useSdfFilter({ material }) or to WebGLLens.material.";

let opticsWarningShown = false;

/**
 * True outside production builds. Bundlers replace `process.env.NODE_ENV`
 * literally; where nothing defines `process` the check fails closed.
 */
function isDevelopmentBuild() {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

export interface GlassProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  as?: GlassElement;
  children?: ReactNode;
  material?: MaterialPresetName;
  /**
   * Which appearance the material is drawn for. `auto` follows the nearest
   * theme. A tone that differs from it also scopes the theme: the element gets
   * that appearance's `--ogui-color-*` tokens, `data-ogui-appearance` and
   * `color-scheme`, and descendants (including nested `Glass`) resolve
   * against it, so text and recipes inside stay readable.
   */
  tone?: MaterialTone | "auto";
  renderer?: RendererPreference;
  source?: RendererSource;
  interactive?: boolean;
  /**
   * Optical parameters merged over the material preset.
   *
   * Only `frost` changes what `Glass` paints, on every renderer path: it sets
   * the material's blur and fill density. The refraction fields (`thickness`,
   * `ior`, `dispersion`, `edgeStrength`, `bevel`) are only reported, as
   * `data-ogui-thickness` and `data-ogui-ior`; choosing another `renderer`
   * does not make `Glass` refract with them. To refract, pass one material
   * object to `useSdfFilter({ material })` (and its filter id to `filterId`)
   * or to `WebGLLens.material`. Development builds warn once when a
   * refraction field is set here.
   */
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

export const Glass = /* @__PURE__ */ forwardRef<HTMLElement, GlassProps>(function Glass(
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
  // A surface whose tone differs from the surrounding appearance carries that
  // tone's own ink, so the material text and every descendant reading
  // --ogui-color-* stays readable. A matching tone renders exactly as before.
  const toneScope = resolveToneScope(theme, resolvedTone);
  const pointerField = useGlassPointerField(interactive && runtime.motion === "on");
  // An explicitly-undefined optics field must fall back to the preset value
  // instead of clobbering it, so conditional overrides like
  // `optics={{ thickness: focused ? 0.9 : undefined }}` stay safe.
  const opticsOverrides = Object.fromEntries(
    Object.entries(optics ?? {}).filter(([, value]) => value !== undefined),
  ) as Partial<GlassMaterial>;
  const resolvedMaterial = { ...getMaterialPreset(material), ...opticsOverrides };
  const setsRefractionOptics = Object.keys(opticsOverrides).some((name) => name !== "frost");
  useEffect(() => {
    if (setsRefractionOptics && !opticsWarningShown && isDevelopmentBuild()) {
      opticsWarningShown = true;
      console.warn(GLASS_OPTICS_WARNING);
    }
  }, [setsRefractionOptics]);
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
    ...(toneScope ? { ...toneScope.colorTokens, colorScheme: resolvedTone } : {}),
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

  const host = createElement(
    as,
    {
      // Before `rest`, so an explicit attribute from the caller still wins.
      ...(toneScope ? { "data-ogui-appearance": resolvedTone } : {}),
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

  // Always the same provider boundary, so the tree keeps its shape when the
  // app appearance flips and the tone starts or stops differing from it.
  // Otherwise every descendant would remount and lose its state and focus.
  // It wraps the host element rather than its children, so the host receives
  // exactly the children the caller passed (none when the caller uses
  // `dangerouslySetInnerHTML`). A matching tone re-provides the surrounding
  // theme, and a provider adds no markup.
  return (
    <GlassThemeContext.Provider value={toneScope?.runtime ?? theme}>
      {host}
    </GlassThemeContext.Provider>
  );
});
