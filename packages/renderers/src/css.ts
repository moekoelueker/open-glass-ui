import type { GlassDesign, MaterialPresetName } from "@open-glass-ui/core";

export type MaterialTone = "dark" | "light";

export interface CssMaterialOptions {
  material: MaterialPresetName;
  tone: MaterialTone;
  backdropFilter?: boolean;
  reducedTransparency?: boolean;
  forcedColors?: boolean;
  /**
   * Overrides the material preset's own frost, in the range 0 to 1.
   *
   * Without this, `<Glass optics={{ frost }}>` changed the reported optics but
   * nothing a user could see, because the CSS material was selected purely by
   * preset name. Supplying it interpolates blur and surface opacity between the
   * three presets, so the three named materials still render exactly as before
   * and any value between or beyond them lands somewhere sensible.
   */
  frost?: number;
  /**
   * Visual language for the material. Defaults to `classic` here so direct
   * callers of this function keep their 0.3 output; `<Glass>` passes the
   * theme's design, which defaults to `liquid`.
   */
  design?: GlassDesign;
}

/**
 * Blur radius and surface opacity at each preset's own frost value. These are
 * the anchors the interpolation passes through, so `frost: 0.24` reproduces the
 * `regular` material exactly rather than approximating it.
 */
const FROST_ANCHORS: readonly [number, number, number] = [0.04, 0.24, 0.66];
const BLUR_ANCHORS: readonly [number, number, number] = [10, 22, 34];
const ALPHA_ANCHORS: Record<MaterialTone, readonly [number, number, number]> = {
  dark: [0.3, 0.58, 0.72],
  light: [0.24, 0.58, 0.76],
};
const LIQUID_BLUR_ANCHORS: readonly [number, number, number] = [3, 14, 30];
const LIQUID_ALPHA_ANCHORS: Record<MaterialTone, readonly [number, number, number]> = {
  dark: [0.22, 0.36, 0.55],
  light: [0.45, 0.5, 0.7],
};

function interpolateByFrost(frost: number, values: readonly [number, number, number]): number {
  const [lowFrost, midFrost, highFrost] = FROST_ANCHORS;
  const [low, mid, high] = values;

  if (frost <= lowFrost) {
    return low;
  }
  if (frost >= highFrost) {
    return high;
  }
  if (frost <= midFrost) {
    return low + (mid - low) * ((frost - lowFrost) / (midFrost - lowFrost));
  }
  return mid + (high - mid) * ((frost - midFrost) / (highFrost - midFrost));
}

/**
 * Rewrites the blur radius and the surface alpha in already-built tokens.
 * Every other channel stays as the chosen material defined it, so overriding
 * frost changes how dense the material reads without changing its hue.
 */
function applyFrostOverride(
  tokens: CssMaterialTokens,
  frost: number,
  tone: MaterialTone,
): CssMaterialTokens {
  const blur = interpolateByFrost(frost, BLUR_ANCHORS);
  const alpha = interpolateByFrost(frost, ALPHA_ANCHORS[tone]);

  return {
    ...tokens,
    "--ogui-material-filter": tokens["--ogui-material-filter"].replace(
      /blur\([\d.]+px\)/,
      `blur(${blur.toFixed(2)}px)`,
    ),
    "--ogui-material-background": tokens["--ogui-material-background"].replace(
      /\/\s*[\d.]+\)/,
      `/ ${alpha.toFixed(3)})`,
    ),
  };
}

export interface CssMaterialTokens {
  "--ogui-material-background": string;
  "--ogui-material-border": string;
  "--ogui-material-highlight": string;
  "--ogui-material-shadow": string;
  "--ogui-material-text": string;
  "--ogui-material-muted": string;
  "--ogui-material-filter": string;
  "--ogui-material-dim": string;
}

export interface CssMaterialStyle {
  background: string;
  borderColor: string;
  boxShadow: string;
  color: string;
  backdropFilter: string;
  WebkitBackdropFilter: string;
}

const DARK_TEXT = "var(--ogui-color-text, #f7f6f0)";
const DARK_MUTED = "var(--ogui-color-muted, #c9cbc7)";
const LIGHT_TEXT = "var(--ogui-color-text, #101418)";
const LIGHT_MUTED = "var(--ogui-color-muted, #424a50)";

function opaqueTokens(tone: MaterialTone): CssMaterialTokens {
  const dark = tone === "dark";

  return {
    "--ogui-material-background": dark ? "#15191c" : "#f5f2e9",
    "--ogui-material-border": dark ? "#6f777c" : "#596269",
    "--ogui-material-highlight": "#ffffff",
    "--ogui-material-shadow": dark
      ? "0 18px 48px rgb(0 0 0 / 0.44)"
      : "0 18px 48px rgb(24 31 36 / 0.18)",
    "--ogui-material-text": dark ? DARK_TEXT : LIGHT_TEXT,
    "--ogui-material-muted": dark ? DARK_MUTED : LIGHT_MUTED,
    "--ogui-material-filter": "none",
    "--ogui-material-dim": dark ? "rgb(0 0 0 / 0.34)" : "rgb(255 255 255 / 0.42)",
  };
}

/**
 * Liquid material. Compared with classic it is clearer (less blur, lower fill)
 * and far more saturated, so the content beneath reads as lensed colour rather
 * than grey fog.
 *
 * Every optical value is a default multiplied by a public `--ogui-glass-*`
 * custom property (see `createGlassLookTokens`), so a site, a section, or a
 * single element can re-art-direct the glass without touching components. The
 * specular rim itself is drawn by the stylesheet as a ring on the element's
 * outer edge; the inline tokens carry the fill, the backdrop filter, a soft
 * inner bloom on the lit side, the edge lensing glow, and the drop shadow.
 */
const LIQUID_OPTICS: Record<
  MaterialPresetName,
  { blur: number; saturation: number; brightness: Record<MaterialTone, number>; spread: number }
> = {
  // Dark glass dims what sits behind it and light glass lifts it, the way
  // platform glass keeps text legible over bright or busy content.
  clear: { blur: 3, saturation: 1.9, brightness: { dark: 0.46, light: 1.25 }, spread: 14 },
  regular: { blur: 14, saturation: 1.85, brightness: { dark: 0.56, light: 1.12 }, spread: 16 },
  frosted: { blur: 30, saturation: 1.7, brightness: { dark: 0.56, light: 1.08 }, spread: 20 },
};

const LIQUID_ALPHA: Record<MaterialPresetName, Record<MaterialTone, number>> = {
  clear: { dark: 0.22, light: 0.45 },
  regular: { dark: 0.36, light: 0.5 },
  frosted: { dark: 0.55, light: 0.7 },
};

const LIGHT_ANGLE = "var(--ogui-glass-light-angle, 340deg)";

/**
 * Secondary text on liquid glass is "vibrant": the theme's muted colour pulled
 * part of the way towards the primary ink, so it stays visibly secondary but
 * keeps its contrast over bright or busy backdrops.
 */
const LIQUID_DARK_MUTED = `color-mix(in srgb, ${DARK_MUTED} 55%, ${DARK_TEXT})`;
const LIQUID_LIGHT_MUTED = `color-mix(in srgb, ${LIGHT_MUTED} 55%, ${LIGHT_TEXT})`;

function liquidTokens(
  material: MaterialPresetName,
  tone: MaterialTone,
  frost?: number,
): CssMaterialTokens {
  const dark = tone === "dark";
  const optics = LIQUID_OPTICS[material];
  const blur = frost === undefined ? optics.blur : interpolateByFrost(frost, LIQUID_BLUR_ANCHORS);
  const alpha =
    frost === undefined
      ? LIQUID_ALPHA[material][tone]
      : interpolateByFrost(frost, LIQUID_ALPHA_ANCHORS[tone]);
  const tint = dark
    ? "rgb(16 18 24)"
    : material === "frosted"
      ? "rgb(250 250 252)"
      : "rgb(255 255 255)";
  const shadow = (value: number) => `calc(${value} * var(--ogui-glass-shadow, 1))`;
  const ink = dark ? "0 0 0" : "20 28 40";
  const near = dark ? 0.16 : 0.05;
  const far = dark ? 0.42 : 0.2;

  return {
    "--ogui-material-background": `color-mix(in srgb, var(--ogui-glass-tint-${tone}, var(--ogui-glass-tint, ${tint})) min(100%, calc(${(alpha * 100).toFixed(1)}% * var(--ogui-glass-opacity, 1))), transparent)`,
    // The ring drawn by the stylesheet replaces the border, so the border is
    // kept for layout but never painted. That is what keeps the edge single.
    "--ogui-material-border": "transparent",
    "--ogui-material-highlight": "rgb(255 255 255 / 0.85)",
    "--ogui-material-shadow": [
      // Bloom on the lit side, following the light angle.
      `inset calc(sin(${LIGHT_ANGLE}) * -12px) calc(cos(${LIGHT_ANGLE}) * 12px) 20px -14px rgb(255 255 255 / calc(${dark ? 0.24 : 0.6} * var(--ogui-glass-rim, 1)))`,
      // Edge lensing: the brighter inner band that reads as thickness.
      `inset 0 0 calc(16px * var(--ogui-glass-lensing, 1)) rgb(255 255 255 / calc(${dark ? 0.05 : 0.3} * var(--ogui-glass-lensing, 1)))`,
      `0 1px 2px rgb(${ink} / ${shadow(near)})`,
      `0 ${optics.spread}px ${optics.spread * 3}px -8px rgb(${ink} / ${shadow(far)})`,
    ].join(", "),
    "--ogui-material-text": dark ? DARK_TEXT : LIGHT_TEXT,
    "--ogui-material-muted": dark ? LIQUID_DARK_MUTED : LIQUID_LIGHT_MUTED,
    "--ogui-material-filter": `blur(calc(${blur.toFixed(2)}px * var(--ogui-glass-blur, 1))) saturate(calc(${optics.saturation} * var(--ogui-glass-saturation, 1))) brightness(calc(${optics.brightness[tone]} * var(--ogui-glass-brightness, 1)))`,
    "--ogui-material-dim": dark ? "rgb(0 0 0 / 0.22)" : "rgb(255 255 255 / 0.28)",
  };
}

export function createCssMaterialTokens(options: CssMaterialOptions): CssMaterialTokens {
  const dark = options.tone === "dark";
  const withFrost = (tokens: CssMaterialTokens) =>
    typeof options.frost === "number" && Number.isFinite(options.frost)
      ? applyFrostOverride(tokens, Math.min(Math.max(options.frost, 0), 1), options.tone)
      : tokens;

  if (options.forcedColors) {
    return {
      "--ogui-material-background": "Canvas",
      "--ogui-material-border": "CanvasText",
      "--ogui-material-highlight": "Highlight",
      "--ogui-material-shadow": "none",
      "--ogui-material-text": "CanvasText",
      "--ogui-material-muted": "CanvasText",
      "--ogui-material-filter": "none",
      "--ogui-material-dim": "transparent",
    };
  }

  if (options.reducedTransparency) {
    return opaqueTokens(options.tone);
  }

  const supported = options.backdropFilter ?? true;
  const text = dark ? DARK_TEXT : LIGHT_TEXT;
  const muted = dark ? DARK_MUTED : LIGHT_MUTED;

  if (!supported) {
    return {
      ...opaqueTokens(options.tone),
      "--ogui-material-background": dark ? "rgb(18 23 26 / 0.94)" : "rgb(248 245 236 / 0.94)",
    };
  }

  if (options.design === "liquid") {
    return liquidTokens(
      options.material,
      options.tone,
      typeof options.frost === "number" && Number.isFinite(options.frost)
        ? Math.min(Math.max(options.frost, 0), 1)
        : undefined,
    );
  }

  switch (options.material) {
    case "clear":
      return withFrost({
        "--ogui-material-background": dark ? "rgb(12 18 21 / 0.30)" : "rgb(255 252 244 / 0.24)",
        "--ogui-material-border": dark ? "rgb(255 255 255 / 0.28)" : "rgb(255 255 255 / 0.7)",
        "--ogui-material-highlight": "rgb(255 255 255 / 0.72)",
        "--ogui-material-shadow": dark
          ? "0 20px 58px rgb(0 0 0 / 0.36)"
          : "0 20px 58px rgb(30 39 44 / 0.15)",
        "--ogui-material-text": text,
        "--ogui-material-muted": muted,
        "--ogui-material-filter": "blur(10px) saturate(1.18) brightness(1.04)",
        "--ogui-material-dim": dark ? "rgb(0 0 0 / 0.18)" : "rgb(255 255 255 / 0.18)",
      });
    case "regular":
      return withFrost({
        "--ogui-material-background": dark ? "rgb(18 24 28 / 0.58)" : "rgb(249 247 240 / 0.58)",
        "--ogui-material-border": dark ? "rgb(255 255 255 / 0.24)" : "rgb(255 255 255 / 0.84)",
        "--ogui-material-highlight": "rgb(255 255 255 / 0.62)",
        "--ogui-material-shadow": dark
          ? "0 22px 64px rgb(0 0 0 / 0.40)"
          : "0 22px 64px rgb(25 35 40 / 0.16)",
        "--ogui-material-text": text,
        "--ogui-material-muted": muted,
        "--ogui-material-filter": "blur(22px) saturate(1.22) brightness(1.02)",
        "--ogui-material-dim": dark ? "rgb(0 0 0 / 0.28)" : "rgb(255 255 255 / 0.34)",
      });
    case "frosted":
      return withFrost({
        "--ogui-material-background": dark ? "rgb(26 31 34 / 0.72)" : "rgb(247 244 236 / 0.76)",
        "--ogui-material-border": dark ? "rgb(255 255 255 / 0.2)" : "rgb(255 255 255 / 0.9)",
        "--ogui-material-highlight": "rgb(255 255 255 / 0.48)",
        "--ogui-material-shadow": dark
          ? "0 24px 72px rgb(0 0 0 / 0.46)"
          : "0 24px 72px rgb(25 35 40 / 0.18)",
        "--ogui-material-text": text,
        "--ogui-material-muted": muted,
        "--ogui-material-filter": "blur(34px) saturate(1.08) brightness(1.05)",
        "--ogui-material-dim": dark ? "rgb(0 0 0 / 0.34)" : "rgb(255 255 255 / 0.48)",
      });
  }
}

export function createCssMaterialStyle(tokens: CssMaterialTokens): CssMaterialStyle {
  return {
    background: tokens["--ogui-material-background"],
    borderColor: tokens["--ogui-material-border"],
    boxShadow: tokens["--ogui-material-shadow"],
    color: tokens["--ogui-material-text"],
    backdropFilter: tokens["--ogui-material-filter"],
    WebkitBackdropFilter: tokens["--ogui-material-filter"],
  };
}
