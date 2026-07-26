import type { MaterialPresetName } from "@open-glass-ui/core";

export type MaterialTone = "dark" | "light";

export interface CssMaterialOptions {
  material: MaterialPresetName;
  tone: MaterialTone;
  backdropFilter?: boolean;
  reducedTransparency?: boolean;
  forcedColors?: boolean;
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
      return {
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
      };
    case "regular":
      return {
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
      };
    case "frosted":
      return {
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
      };
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
