import { clamp, finite } from "./math";

/**
 * Art direction for liquid glass. Every numeric field except the two light
 * angles is a multiplier where `1` is the default look, so values compose
 * predictably with the per-surface materials (clear, regular, frosted).
 */
export interface GlassLook {
  /** Backdrop blur multiplier. 0 is perfectly clear, 2+ is heavily frosted. */
  blur?: number;
  /** Tint opacity multiplier. Low is see-through, high is dense. */
  opacity?: number;
  /**
   * Tint mixed into every surface (any CSS colour). Pass `{ dark, light }` to
   * tint each appearance differently: a dark tint needs light text, so smoked
   * glass, for example, uses a near-black tint in dark mode and a grey one in
   * light mode.
   */
  tint?: string | { dark?: string; light?: string };
  /** Backdrop saturation multiplier: how vividly colour bleeds through. */
  saturation?: number;
  /** Backdrop brightness multiplier. Below 1 dims what sits behind the glass. */
  brightness?: number;
  /** Whole-edge multiplier: hairline, highlight, and inner bloom. 0 removes the edge. */
  rim?: number;
  /** Directional highlight intensity only (0 to 2). 0 keeps a plain hairline edge. */
  highlight?: number;
  /** Direction light comes from, in degrees: 0 is top, 90 right, 270 left. */
  lightAngle?: number;
  /**
   * How much of the edge the highlight covers, in degrees of arc (0 to 170).
   * 0 switches the directional highlight off, leaving only the hairline.
   */
  lightSpread?: number;
  /** Edge lensing multiplier: the bright inner edge that reads as thickness. */
  lensing?: number;
  /** Depth (drop shadow) multiplier. */
  shadow?: number;
}

export type GlassLookPreset = "liquid" | "frosted" | "clear" | "smoked" | "lensed";

export type GlassLookInput = GlassLookPreset | GlassLook;

export interface GlassLookTokens {
  "--ogui-glass-blur"?: string;
  "--ogui-glass-opacity"?: string;
  "--ogui-glass-tint"?: string;
  "--ogui-glass-tint-dark"?: string;
  "--ogui-glass-tint-light"?: string;
  "--ogui-glass-saturation"?: string;
  "--ogui-glass-brightness"?: string;
  "--ogui-glass-rim"?: string;
  "--ogui-glass-highlight"?: string;
  "--ogui-glass-light-angle"?: string;
  "--ogui-glass-light-spread"?: string;
  "--ogui-glass-lensing"?: string;
  "--ogui-glass-shadow"?: string;
}

/** Default light: from the top, a little left of centre. */
export const DEFAULT_GLASS_LIGHT_ANGLE = 340;
export const DEFAULT_GLASS_LIGHT_SPREAD = 110;

export const GLASS_LOOK_PRESETS: Readonly<Record<GlassLookPreset, Readonly<GlassLook>>> = {
  /** The default: clear, saturated, lit from the top. */
  liquid: {},
  /** Dense and soft. Content behind reads as colour, not shape. */
  frosted: { blur: 2.2, opacity: 1.6, saturation: 0.8, rim: 0.7, lensing: 0.5 },
  /** Nearly invisible glass defined by its edges. */
  clear: { blur: 0.25, opacity: 0.85, saturation: 1.1, rim: 1.25, lensing: 1.2 },
  /** See-through but dark and faded, like tinted glass. */
  smoked: {
    blur: 0.8,
    opacity: 1.9,
    tint: { dark: "rgb(8 10 14)", light: "rgb(206 210 218)" },
    saturation: 0.7,
    brightness: 0.8,
    rim: 0.75,
  },
  /** Thick, light-bending glass: strong edges, little frost. */
  lensed: { blur: 0.5, opacity: 0.85, saturation: 1.25, rim: 1.45, lensing: 2, lightSpread: 160 },
};

const RANGES = {
  blur: [0, 4],
  opacity: [0, 3],
  saturation: [0, 3],
  brightness: [0.3, 2],
  rim: [0, 2],
  highlight: [0, 2],
  lensing: [0, 3],
  shadow: [0, 3],
} as const;

function number(value: number | undefined, [low, high]: readonly [number, number]) {
  return value === undefined ? undefined : clamp(finite(value, 1), low, high);
}

export function resolveGlassLook(input: GlassLookInput = "liquid"): GlassLook {
  return typeof input === "string" ? { ...(GLASS_LOOK_PRESETS[input] ?? {}) } : { ...input };
}

/**
 * Converts a look into the `--ogui-glass-*` custom properties the liquid design
 * reads. Only fields that are set are emitted, so a look applied to one
 * element overrides just those fields and inherits the rest.
 */
export function createGlassLookTokens(input: GlassLookInput = "liquid"): GlassLookTokens {
  const look = resolveGlassLook(input);
  const tokens: GlassLookTokens = {};
  const put = (name: keyof GlassLookTokens, value: number | undefined, unit = "") => {
    if (value !== undefined) {
      tokens[name] = `${Number(value.toFixed(4))}${unit}`;
    }
  };

  put("--ogui-glass-blur", number(look.blur, RANGES.blur));
  put("--ogui-glass-opacity", number(look.opacity, RANGES.opacity));
  put("--ogui-glass-saturation", number(look.saturation, RANGES.saturation));
  put("--ogui-glass-brightness", number(look.brightness, RANGES.brightness));
  put("--ogui-glass-rim", number(look.rim, RANGES.rim));
  put("--ogui-glass-highlight", number(look.highlight, RANGES.highlight));
  put("--ogui-glass-lensing", number(look.lensing, RANGES.lensing));
  put("--ogui-glass-shadow", number(look.shadow, RANGES.shadow));
  if (look.lightAngle !== undefined) {
    put("--ogui-glass-light-angle", ((finite(look.lightAngle, 0) % 360) + 360) % 360, "deg");
  }
  if (look.lightSpread !== undefined) {
    const spread = clamp(finite(look.lightSpread, 110), 0, 170);
    // A zero-width conic stop can still leave a one-pixel sliver, so no
    // spread means no highlight.
    put("--ogui-glass-light-spread", Math.max(spread, 1), "deg");
    if (spread === 0) {
      tokens["--ogui-glass-highlight"] = "0";
    }
  }
  const color = (value: string | undefined) => {
    if (value === undefined || value.trim() === "") return undefined;
    // Reject anything that could break out of the declaration.
    if (/[;{}]/.test(value)) {
      throw new Error(`Invalid glass tint "${value}". Use a CSS colour such as #0b0d10.`);
    }
    return value.trim();
  };
  if (typeof look.tint === "string") {
    const tint = color(look.tint);
    if (tint) tokens["--ogui-glass-tint"] = tint;
  } else if (look.tint) {
    const dark = color(look.tint.dark);
    const light = color(look.tint.light);
    if (dark) tokens["--ogui-glass-tint-dark"] = dark;
    if (light) tokens["--ogui-glass-tint-light"] = light;
  }
  return tokens;
}
