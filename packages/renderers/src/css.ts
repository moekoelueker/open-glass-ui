import type { MaterialPresetName } from "@open-glass-ui/core";

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
