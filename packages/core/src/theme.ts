export type GlassAppearance = "dark" | "light";
export type GlassAppearancePreference = GlassAppearance | "system";
export type GlassContrast = "standard" | "high";
export type GlassRadius = "sharp" | "balanced" | "soft";
export type GlassThemePreset = "neutral" | "cobalt" | "teal" | "violet" | "coral" | "amber";

export interface GlassThemeInput {
  preset?: GlassThemePreset;
  accent?: string;
  secondary?: string;
  tertiary?: string;
  contrast?: GlassContrast;
  radius?: GlassRadius;
}

export interface GlassThemePalette {
  appearance: GlassAppearance;
  background: string;
  canvas: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  muted: string;
  border: string;
  borderStrong: string;
  control: string;
  controlHover: string;
  controlActive: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  secondary: string;
  tertiary: string;
  focus: string;
  danger: string;
  dangerInk: string;
  success: string;
  successInk: string;
  warning: string;
  warningInk: string;
  radiusControl: string;
  radiusSurface: string;
  accentContrast: number;
}

export interface GlassThemeTokens {
  "--ogui-color-background": string;
  "--ogui-color-canvas": string;
  "--ogui-color-surface": string;
  "--ogui-color-surface-strong": string;
  "--ogui-color-text": string;
  "--ogui-color-muted": string;
  "--ogui-color-border": string;
  "--ogui-color-border-strong": string;
  "--ogui-color-control": string;
  "--ogui-color-control-hover": string;
  "--ogui-color-control-active": string;
  "--ogui-color-accent": string;
  "--ogui-color-accent-ink": string;
  "--ogui-color-accent-soft": string;
  "--ogui-color-secondary": string;
  "--ogui-color-tertiary": string;
  "--ogui-color-focus": string;
  "--ogui-color-danger": string;
  "--ogui-color-danger-ink": string;
  "--ogui-color-success": string;
  "--ogui-color-success-ink": string;
  "--ogui-color-warning": string;
  "--ogui-color-warning-ink": string;
  "--ogui-radius-control": string;
  "--ogui-radius-surface": string;
}

const HEX_COLOR = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;

const PRESET_ACCENTS: Record<
  GlassThemePreset,
  Record<GlassAppearance, { accent: string; secondary: string; tertiary: string }>
> = {
  neutral: {
    dark: { accent: "#f4f3ee", secondary: "#c8cbc6", tertiary: "#8d938f" },
    light: { accent: "#151719", secondary: "#4f5652", tertiary: "#8a8f8b" },
  },
  cobalt: {
    dark: { accent: "#7896ff", secondary: "#a5b7ff", tertiary: "#6fd5e8" },
    light: { accent: "#315ee8", secondary: "#5e72cb", tertiary: "#16788c" },
  },
  teal: {
    dark: { accent: "#43d6b0", secondary: "#83dfc9", tertiary: "#75bde5" },
    light: { accent: "#087f6b", secondary: "#337d72", tertiary: "#276b91" },
  },
  violet: {
    dark: { accent: "#aa92ff", secondary: "#c4b7f6", tertiary: "#e39abf" },
    light: { accent: "#6549d5", secondary: "#765fb4", tertiary: "#a14472" },
  },
  coral: {
    dark: { accent: "#ff8a76", secondary: "#ffb09f", tertiary: "#f2c368" },
    light: { accent: "#c94735", secondary: "#a95748", tertiary: "#8c6400" },
  },
  amber: {
    dark: { accent: "#f1c75b", secondary: "#e7d08e", tertiary: "#db9162" },
    light: { accent: "#966300", secondary: "#836b2e", tertiary: "#9c4f2e" },
  },
};

const RADII: Record<GlassRadius, { control: string; surface: string }> = {
  sharp: { control: "0.5rem", surface: "0.75rem" },
  balanced: { control: "0.8rem", surface: "1.2rem" },
  soft: { control: "1.05rem", surface: "1.65rem" },
};

function expandHex(color: string) {
  const normalized = color.toLowerCase();
  if (!HEX_COLOR.test(normalized)) {
    throw new Error(
      `Invalid theme color "${color}". Use a three- or six-digit hexadecimal color such as #5b7cff.`,
    );
  }
  if (normalized.length === 4) {
    return `#${normalized
      .slice(1)
      .split("")
      .map((channel) => `${channel}${channel}`)
      .join("")}`;
  }
  return normalized;
}

function rgb(color: string) {
  const value = expandHex(color).slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function channelLuminance(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: string) {
  const value = rgb(color);
  return (
    channelLuminance(value.r) * 0.2126 +
    channelLuminance(value.g) * 0.7152 +
    channelLuminance(value.b) * 0.0722
  );
}

export function contrastRatio(first: string, second: string) {
  const high = Math.max(relativeLuminance(first), relativeLuminance(second));
  const low = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (high + 0.05) / (low + 0.05);
}

export function readableForeground(background: string) {
  const dark = "#101214";
  const light = "#f9f8f3";
  return contrastRatio(background, dark) >= contrastRatio(background, light) ? dark : light;
}

function alpha(color: string, opacity: number) {
  const value = rgb(color);
  return `rgb(${value.r} ${value.g} ${value.b} / ${opacity})`;
}

export function createGlassTheme(
  appearance: GlassAppearance,
  input: GlassThemeInput = {},
): GlassThemePalette {
  const dark = appearance === "dark";
  const contrast = input.contrast ?? "high";
  const radius = RADII[input.radius ?? "balanced"];
  const preset = PRESET_ACCENTS[input.preset ?? "neutral"][appearance];
  const accent = expandHex(input.accent ?? preset.accent);
  const accentInk = readableForeground(accent);
  const highContrast = contrast === "high";
  const danger = dark ? "#ff8176" : "#b93630";
  const success = dark ? "#58d79e" : "#15734d";
  const warning = dark ? "#f1c75b" : "#855a00";
  const canvas = dark ? "#0e1113" : "#fbfaf6";
  const focus = contrastRatio(accent, canvas) >= 3 ? accent : readableForeground(canvas);

  return {
    appearance,
    background: dark ? "#080a0b" : "#f4f2ec",
    canvas,
    surface: dark ? "rgb(255 255 255 / 0.075)" : "rgb(255 255 255 / 0.64)",
    surfaceStrong: dark ? "rgb(255 255 255 / 0.12)" : "rgb(255 255 255 / 0.88)",
    text: dark ? "#f7f6f1" : "#111315",
    muted: dark ? (highContrast ? "#bec2bd" : "#a5aaa6") : highContrast ? "#4b514d" : "#606662",
    border: dark
      ? highContrast
        ? "rgb(255 255 255 / 0.2)"
        : "rgb(255 255 255 / 0.14)"
      : highContrast
        ? "rgb(14 18 16 / 0.22)"
        : "rgb(14 18 16 / 0.16)",
    borderStrong: dark ? "rgb(255 255 255 / 0.34)" : "rgb(14 18 16 / 0.38)",
    control: dark ? "rgb(255 255 255 / 0.085)" : "rgb(255 255 255 / 0.7)",
    controlHover: dark ? "rgb(255 255 255 / 0.15)" : "rgb(255 255 255 / 0.96)",
    controlActive: dark ? "rgb(255 255 255 / 0.21)" : "rgb(225 223 216 / 0.96)",
    accent,
    accentInk,
    accentSoft: alpha(accent, dark ? 0.16 : 0.12),
    secondary: expandHex(input.secondary ?? preset.secondary),
    tertiary: expandHex(input.tertiary ?? preset.tertiary),
    focus,
    danger,
    dangerInk: readableForeground(danger),
    success,
    successInk: readableForeground(success),
    warning,
    warningInk: readableForeground(warning),
    radiusControl: radius.control,
    radiusSurface: radius.surface,
    accentContrast: contrastRatio(accent, accentInk),
  };
}

export function createGlassThemeTokens(palette: GlassThemePalette): GlassThemeTokens {
  return {
    "--ogui-color-background": palette.background,
    "--ogui-color-canvas": palette.canvas,
    "--ogui-color-surface": palette.surface,
    "--ogui-color-surface-strong": palette.surfaceStrong,
    "--ogui-color-text": palette.text,
    "--ogui-color-muted": palette.muted,
    "--ogui-color-border": palette.border,
    "--ogui-color-border-strong": palette.borderStrong,
    "--ogui-color-control": palette.control,
    "--ogui-color-control-hover": palette.controlHover,
    "--ogui-color-control-active": palette.controlActive,
    "--ogui-color-accent": palette.accent,
    "--ogui-color-accent-ink": palette.accentInk,
    "--ogui-color-accent-soft": palette.accentSoft,
    "--ogui-color-secondary": palette.secondary,
    "--ogui-color-tertiary": palette.tertiary,
    "--ogui-color-focus": palette.focus,
    "--ogui-color-danger": palette.danger,
    "--ogui-color-danger-ink": palette.dangerInk,
    "--ogui-color-success": palette.success,
    "--ogui-color-success-ink": palette.successInk,
    "--ogui-color-warning": palette.warning,
    "--ogui-color-warning-ink": palette.warningInk,
    "--ogui-radius-control": palette.radiusControl,
    "--ogui-radius-surface": palette.radiusSurface,
  };
}
