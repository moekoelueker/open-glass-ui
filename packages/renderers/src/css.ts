import type { MaterialPresetName } from "@prism-lab/core";

export type MaterialTone = "dark" | "light";

export interface CssMaterialOptions {
  material: MaterialPresetName;
  tone: MaterialTone;
  backdropFilter?: boolean;
  reducedTransparency?: boolean;
  forcedColors?: boolean;
}

export interface CssMaterialTokens {
  "--prism-material-background": string;
  "--prism-material-border": string;
  "--prism-material-highlight": string;
  "--prism-material-shadow": string;
  "--prism-material-text": string;
  "--prism-material-muted": string;
  "--prism-material-filter": string;
  "--prism-material-dim": string;
}

export interface CssMaterialStyle {
  background: string;
  borderColor: string;
  boxShadow: string;
  color: string;
  backdropFilter: string;
  WebkitBackdropFilter: string;
}

const DARK_TEXT = "#f7f6f0";
const DARK_MUTED = "#c9cbc7";
const LIGHT_TEXT = "#101418";
const LIGHT_MUTED = "#424a50";

function opaqueTokens(tone: MaterialTone): CssMaterialTokens {
  const dark = tone === "dark";

  return {
    "--prism-material-background": dark ? "#15191c" : "#f5f2e9",
    "--prism-material-border": dark ? "#6f777c" : "#596269",
    "--prism-material-highlight": "#ffffff",
    "--prism-material-shadow": dark
      ? "0 18px 48px rgb(0 0 0 / 0.44)"
      : "0 18px 48px rgb(24 31 36 / 0.18)",
    "--prism-material-text": dark ? DARK_TEXT : LIGHT_TEXT,
    "--prism-material-muted": dark ? DARK_MUTED : LIGHT_MUTED,
    "--prism-material-filter": "none",
    "--prism-material-dim": dark ? "rgb(0 0 0 / 0.34)" : "rgb(255 255 255 / 0.42)",
  };
}

export function createCssMaterialTokens(options: CssMaterialOptions): CssMaterialTokens {
  const dark = options.tone === "dark";

  if (options.forcedColors) {
    return {
      "--prism-material-background": "Canvas",
      "--prism-material-border": "CanvasText",
      "--prism-material-highlight": "Highlight",
      "--prism-material-shadow": "none",
      "--prism-material-text": "CanvasText",
      "--prism-material-muted": "CanvasText",
      "--prism-material-filter": "none",
      "--prism-material-dim": "transparent",
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
      "--prism-material-background": dark ? "rgb(18 23 26 / 0.94)" : "rgb(248 245 236 / 0.94)",
    };
  }

  switch (options.material) {
    case "clear":
      return {
        "--prism-material-background": dark ? "rgb(12 18 21 / 0.30)" : "rgb(255 252 244 / 0.24)",
        "--prism-material-border": dark ? "rgb(255 255 255 / 0.28)" : "rgb(255 255 255 / 0.7)",
        "--prism-material-highlight": "rgb(255 255 255 / 0.72)",
        "--prism-material-shadow": dark
          ? "0 20px 58px rgb(0 0 0 / 0.36)"
          : "0 20px 58px rgb(30 39 44 / 0.15)",
        "--prism-material-text": text,
        "--prism-material-muted": muted,
        "--prism-material-filter": "blur(10px) saturate(1.18) brightness(1.04)",
        "--prism-material-dim": dark ? "rgb(0 0 0 / 0.18)" : "rgb(255 255 255 / 0.18)",
      };
    case "regular":
      return {
        "--prism-material-background": dark ? "rgb(18 24 28 / 0.58)" : "rgb(249 247 240 / 0.58)",
        "--prism-material-border": dark ? "rgb(255 255 255 / 0.24)" : "rgb(255 255 255 / 0.84)",
        "--prism-material-highlight": "rgb(255 255 255 / 0.62)",
        "--prism-material-shadow": dark
          ? "0 22px 64px rgb(0 0 0 / 0.40)"
          : "0 22px 64px rgb(25 35 40 / 0.16)",
        "--prism-material-text": text,
        "--prism-material-muted": muted,
        "--prism-material-filter": "blur(22px) saturate(1.22) brightness(1.02)",
        "--prism-material-dim": dark ? "rgb(0 0 0 / 0.28)" : "rgb(255 255 255 / 0.34)",
      };
    case "frosted":
      return {
        "--prism-material-background": dark ? "rgb(26 31 34 / 0.72)" : "rgb(247 244 236 / 0.76)",
        "--prism-material-border": dark ? "rgb(255 255 255 / 0.2)" : "rgb(255 255 255 / 0.9)",
        "--prism-material-highlight": "rgb(255 255 255 / 0.48)",
        "--prism-material-shadow": dark
          ? "0 24px 72px rgb(0 0 0 / 0.46)"
          : "0 24px 72px rgb(25 35 40 / 0.18)",
        "--prism-material-text": text,
        "--prism-material-muted": muted,
        "--prism-material-filter": "blur(34px) saturate(1.08) brightness(1.05)",
        "--prism-material-dim": dark ? "rgb(0 0 0 / 0.34)" : "rgb(255 255 255 / 0.48)",
      };
  }
}

export function createCssMaterialStyle(tokens: CssMaterialTokens): CssMaterialStyle {
  return {
    background: tokens["--prism-material-background"],
    borderColor: tokens["--prism-material-border"],
    boxShadow: tokens["--prism-material-shadow"],
    color: tokens["--prism-material-text"],
    backdropFilter: tokens["--prism-material-filter"],
    WebkitBackdropFilter: tokens["--prism-material-filter"],
  };
}
